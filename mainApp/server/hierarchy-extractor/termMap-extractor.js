var promise = require('bluebird');
var contextTermExtractor = require('./contextTerm-extractor');
var commonUtils = require('../utils/commonUtils');
var map = promise.map;

var TermMapCreator = function(conf){
	this.fileId = conf.fileId;
	this.esQueryHelper = conf.esQueryHelper;
	this.contextTermExtractor = new contextTermExtractor(conf);
	this.contexts = [];
	this.contextUniqueItemMap = this.contextUniqueItemMap;
	this.termMap = {}
	this.contextTermMap = null;
}

TermMapCreator.prototype = {
	dispose:function(){
		this.contextTermExtractor.dispose();
		this.contextTermExtractor = null;
		this.esQueryHelper = null;
		this.contextUniqueItemMap = null;
		this.contexts = null;
		this.termMap = {};
		this.contextTermMap = null;
	},

	getContextTermMap:function(){
		return this.contextTermExtractor.getContextTermMap()
			.then(function(contextTermMap){
				return this.handleContextMapCallback(contextTermMap);
			}.bind(this))
	},

	getAllTermMap:function(){
		return this.getContextTermMap()
					 .then(function(){
					 	return this.contextTermMap;
					 }.bind(this))
	},

	handleContextMapCallback:function(contextTermMap){
		var contexts = Object.keys(contextTermMap);
		this.contextTermMap = contextTermMap;

		return map(contexts,function(context){
			return this.handleTermMap(context);
		}.bind(this));
	},

	handleTermMap:function(context){
		var termMap = this.contextTermMap[context].termMap;
		var terms = Object.keys(termMap);

		return map(terms,function(term){
			return this.startGettingTermMap(context,term);
		}.bind(this));
	},

	startGettingTermMap:function(context,term){
		return this.handleUniqueTermMapForEachTerm(term,context);
	},

	handleUniqueTermMapForEachTerm:function(term,context,callback){
		var searchObj = {};
		searchObj["key"] = context;
		searchObj["value"] = term;
		var searchTerms = [searchObj];
		var contexts = Object.keys(this.contextTermMap);
		var aggFields = contexts;
		var esQuery = this.esQueryHelper.createESQuery(searchTerms,aggFields,true);
		var indexName = commonUtils.getIndexNameForSearchData(this.fileId);
		var indexType = commonUtils.getTypeNameForSearchData(this.fileId);

		return this.esQueryHelper.run(esQuery,indexName,indexType)
				.then(function(data,err){
					if(err){
						throw err;
						return;
					}
					var processedData = this.processData(context,data,term);
					var termobj = this.contextTermMap[context].termMap[term];
					termobj["contextMap"] = processedData.contextMap;
					termobj["terms"] = processedData.terms;
					return '';
				}.bind(this)) 
	},

	processData:function(termContext,aggs,term){
		var contexts = Object.keys(this.contextTermMap);
		var termMap = {};
		var contextMap = {};
		contexts.forEach(function(context){
			if(context == termContext){

			}
			else{
				var terms = aggs[context].buckets;
				if(terms && terms.length > 0){
					var uniqueCount = terms.length;
					var totalCount = 0;
					terms.forEach(function(term){
						/*if(term == ''){
							uniqueCount--;
						}
						else{*/
							termMap[term.key] = {
								'count':term.doc_count,
								'context':context
							}
							totalCount += term.doc_count;
						//}
					});
					contextMap[context] = {'uniqueCount':uniqueCount,'tCount':totalCount};
				}
			}	
		});
		return {contextMap:contextMap,terms:termMap};
	}
};

module.exports = TermMapCreator;