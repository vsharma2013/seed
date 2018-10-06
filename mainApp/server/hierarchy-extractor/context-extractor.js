var commonUtils = require('../utils/commonUtils');
var typeEnum = require('../../config/config').typeEnum;
var contextExtractor = function(options){
	this.fileId = options.fileId;
	this.esQueryHelper = options.esQueryHelper;
	this.options = options;
}

contextExtractor.prototype = {
	dispose:function(){
		this.esQueryHelper = null;
		this.options = null;
	},

	getAllContexts:function(){
		var searchTerms = [];
		var aggFields = ['type'];
		var esQuery = this.esQueryHelper.createESQuery(searchTerms,aggFields,true);
		var indexName = commonUtils.getIndexNameForBusinessData(this.fileId);
		var indexType = '';//commonUtils.getTypeNameForBusinessData(this.fileId);
		return this.esQueryHelper.run(esQuery,indexName,indexType)
				.then(function(data,err){
					if(err){
						throw err;
						return;
					}
					var contextData = this.processContextData(data);
					console.log("Context Data created");
					return contextData;
				}.bind(this))
	},

	processContextData:function(data){
		var contexts = [];
		var strContexts = this.getOnlyStringTypeContexts();
		if(data['type']){
			var buckets = data['type'].buckets;
			if(buckets && buckets.length > 0){
				buckets.forEach(function(buc){
					var str = this.getSTRINGContexts(strContexts,buc.key);
					if(str){
						contexts.push(str);
					}
				}.bind(this));
			}
		}
		return contexts;
	},

	getOnlyStringTypeContexts:function(){
		var headerData = this.options.headerData;
		var strContexts = {};

		headerData.forEach(function(headerJson){
			if(headerJson.type == typeEnum.STRING){
				strContexts[headerJson.header] = 1;
			}
		});
		return strContexts;
	},

	getSTRINGContexts:function(strContexts,context){
		//var header = strContexts[context];
		return strContexts[context]?context:false;
	}
};

module.exports = contextExtractor;