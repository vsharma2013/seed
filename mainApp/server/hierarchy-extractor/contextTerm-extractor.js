var contextExtractor = require('./context-extractor');
var commonUtils = require('../utils/commonUtils');

var contextTermExtractor = function(conf){
	this.esQueryHelper = conf.esQueryHelper;
	this.contextExtractor = new contextExtractor(conf);
	this.fileId = conf.fileId;
}

contextTermExtractor.prototype = {
	dispose:function(){
		this.contextExtractor.dispose();
		this.esQueryHelper = null;
	},

	getContextTermMap:function(){
		return this.contextExtractor.getAllContexts()
				.then(function(contextsArr){
					return this.getUniqueTermsForAllContexts(contextsArr);
				}.bind(this));
	},
	getUniqueTermsForAllContexts:function(contextsArr){
		var searchTerms = [];
		var aggFields = contextsArr;
		var esQuery = this.esQueryHelper.createESQuery(searchTerms,aggFields,true);
		var indexName = commonUtils.getIndexNameForSearchData(this.fileId);
		var indexType = commonUtils.getTypeNameForSearchData(this.fileId);
		return this.esQueryHelper.run(esQuery,indexName,indexType).
				then(function(results){
					var processObj = this.processData(contextsArr,results);
					console.log("Context Term Extracted");
					return processObj;
				}.bind(this));
	},

	processData:function(contexts,aggs){
		var termMap = {};
		var contextItemMap = {};
		contexts.forEach(function(context){
			var terms = aggs[context].buckets;
			var uniqueTerms = terms.length;
			var totalTermCount = 0;
			if(!contextItemMap[context]){
				contextItemMap[context] = {uniqueTerms:0,totalItems:0,termMap:{}}
			}
			if(terms && terms.length > 0){
				var totalTerms = 0;
				terms.forEach(function(term){
					/*if(term == ''){
						uniqueTerms--;
					}
					else{*/
						contextItemMap[context].termMap[term.key] = {
							'count':term.doc_count,
							'context':context
						}
						totalTerms += term.doc_count;
					//}
				});
				contextItemMap[context].totalTerms = totalTerms;
				contextItemMap[context].uniqueTerms = uniqueTerms;
			}
		});

		return contextItemMap;
	}
}

module.exports = contextTermExtractor;