var elasticsearch = require('elasticsearch');
var config = require('./../../config/config');
var commonUtils = require('../utils/commonUtils');

function ESHelper(){
	this.client = new elasticsearch.Client({
		host: config.elasticSearch.url,
		requestTimeout : 1000 * 60 *5
	});
};

ESHelper.prototype = {
	runQuery:function(textArr,fileId,cbOnDone){
		this.runContextQueryForAllKeywords(textArr,fileId,cbOnDone);
	},

	runContextQuery:function(textArr,fileId,cbOnDone){
		var esQuery = this.getQueryForContextSearch(textArr,fileId);
		this.client.search(esQuery, function(err, res){
			if(err){
				logger.log(err);
				cbOnDone({success : false, results : 'error in ES query execute'});
			}
			else{
				var hits = res.hits.hits;
				if(hits && hits.length > 0){
					hits = [hits[0]]
				}
				cbOnDone({success : true, results : res});
			}
		});	
	},

	runContextQueryForExactKeywords:function(textArr,fileId,cbOnDone){
		var esQuery = this.getQueryForExactKeywords(textArr,fileId);
		this.client.search(esQuery, function(err, res){
			if(err){
				logger.log(err);
				cbOnDone({success : false, results : 'error in ES query execute'});
			}
			else{
				var hits = res.hits.hits;
				if(hits && hits.length > 0){
					cbOnDone({success : true, results : res});
				}
				else{
					this.runContextQuery(textArr,fileId,cbOnDone)
				}
				
			}
		}.bind(this));	
	},

	runContextQueryForAllKeywords:function(textArr,fileId,cbOnDone){
		var esQuery = this.getQueryForContextSearchForAllKeywords(textArr,fileId);
		this.client.search(esQuery, function(err, res){
			if(err){
				logger.log(err);
				cbOnDone({success : false, results : 'error in ES query execute'});
			}
			else{
				var hits = res.hits.hits;
				if(hits && hits.length == 1){
					cbOnDone({success : true, results : res});
				}
				else{
					this.runContextQueryForExactKeywords(textArr,fileId,cbOnDone)
				}
				
			}
		}.bind(this));	
	},

	getQueryForExactKeywords:function(textArr,fileId){
		var esQuery = {
		    "query" : {
		        "filtered" : {
		            "filter" : {
		                "terms" : { 
		                    "exact_values" : textArr
		                }
		            }
		        }
		    },
		    "from" : 0, 
		    "size" : 100
		};

		var finQuery = {
			index: commonUtils.getIndexNameForBusinessData(fileId),
			body: esQuery
		}

		return finQuery;
	},

	getQueryForContextSearchForAllKeywords:function(textArr,fileId){
		var esQuery = {
		    "query" : {
		        "filtered" : {
		            "filter" : {
		                "terms" : { 
		                    "exact_values" : [textArr.join(' ')]
		                }
		            }
		        }
		    },
		    "from" : 0, 
		    "size" : 100
		};

		var finQuery = {
			index: commonUtils.getIndexNameForBusinessData(fileId),
			body: esQuery
		}

		return finQuery;
	},

	getQueryForContextSearch:function(textArr,fileId){
		var esQuery = {
					    "query": {
					        "match": {
					            "values": {      
					                "query": textArr.join(' ')
					            }
					        }
					    },
					    "from" : 0, 
		    			"size" : 100
					};

		var finQuery = {
			index: commonUtils.getIndexNameForBusinessData(fileId),
			body: esQuery
		}

		return finQuery;
	}
};

module.exports = ESHelper;
