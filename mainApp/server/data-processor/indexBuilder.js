var promise = require('bluebird');
var elasticsearch = require('elasticsearch');
var request = require('request');
var config = require('./../../config/config');
var esConfig = config.elasticSearch;


function IndexBuilder(){
	this.client = new elasticsearch.Client({
		host: esConfig.url,
		requestTimeout : 1000 * 60 *5
		//,log: 'trace'
	});
	this.id = 1;
}

IndexBuilder.prototype = {
	createIndex:function(indexName){
		return this.deleteIndex(indexName)
				.then(function(){
					return this.createNewIndexWithMapping(indexName);
				}.bind(this));
	},

	checkDataCount:function(indexName){
		var options = {
			url : esConfig.url + indexName + '/_count',
			method : 'GET',
		};
		return new promise(function(resolve,failure){
			request(options, function(err, req, body){
				if(err){
					throw err;
					return;
				}
				var data = JSON.parse(body);
				var count = data.count;
				resolve(count);
			});
		});
	},

	deleteIndex:function(indexName){
		var options = {
			index: indexName,
	  		ignore: [404]
		};

		return new promise(function(resolve,failure){
			function deleteSuccess(){
				//logger.log("deleted indices successfully : " + esConfig.salesIndex);
				resolve(true);
			}

			function deleteError(err){
				throw err;
			}

			this.client.indices.delete(options).then(deleteSuccess, deleteError);
		}.bind(this));
	},

	createNewIndexWithMapping : function(indexName){
		var options = {
			url : esConfig.url + indexName,
			method : 'PUT',
		};

		return new promise(function(resolve,failure){ 
			request(options,function(err, req, body){
				if(err){
					throw err;
				}
				var data = JSON.parse(body);
				if(data.acknowledged){
					//logger.log('created index successfully');
					resolve(true);
				}
			});
		});
	},

	putMapping : function(mapping,indexName,indexType){
		var url = esConfig.url + indexName + '/_mapping/' + indexType;
		var options = {
			url : url,
			method : 'PUT',
			json : mapping
		};
		return new promise(function(resolve,failure){ 
			request(options,function(err, req, body){
				if(err){
					//logger.log('error in creating mapping');
					throw err;
					return;
				}
				resolve(true);
			});
		});
	},

	putSettings:function(settings,indexName,indexType,callback){
		var url = esConfig.url + indexName + '/_settings';
		var options = {
			url : url,
			method : 'PUT',
			json : settings
		};
		return new promise(function(resolve,failure){ 
			request(options,function(err, req, body){
				if(err){
					//logger.log('error in creating setting');
					throw err;
					return;
				}
				resolve(true);
			});
		});	
	},

	addDataToIndex:function(data,indexName,indexType,callback){
		var self = this;
		var pageSize = 20000;
		var startIndex = 0;
		var isResponseSent = false;

		return self.handlePartialDataUpdate(data,indexName,indexType,startIndex,pageSize,callback,null);
	},

	handlePartialDataUpdate:function(data,indexName,indexType,startIndex,pageSize,allResp){
		var partialData = data.slice(startIndex,pageSize);

		return new promise(function(resolve,failure){
			if(partialData && partialData.length > 0){
				this.bulkInsert(partialData,indexName,indexType)
					.then(function(resp){
						var finResp = this.collateResponses(allResp,resp);
						startIndex += partialData.length;
						if(partialData.length < pageSize){
							resolve(finResp);
						}
						else{
							this.handlePartialDataUpdate(data,indexName,indexType,startIndex,pageSize,finResp)
									.then(function(finResp){
										resolve(finResp);
									});
						}
					}.bind(this))
			}
			else{
				resolve(allResp);
			}
		}.bind(this));
	},

	beforeBulkInsert:function(indexName,indexType,callback){
		var settings = {
		    "index" : {
		        "refresh_interval" : "-1"
		    } 
		};

		return this.putSettings(settings,indexName,indexType);	
	},

	afterBulkInsert:function(indexName,indexType){
		var settings = {
		    "index" : {
		        "refresh_interval" : "1s"
		    } 
		};

		return this.putSettings(settings,indexName,indexType);
	},

	bulkInsert: function(partialData,indexName,indexType){
		var self = this;
		var bulkQuery = {body : []};
		partialData.forEach(function(sDoc){
			bulkQuery.body.push({
				index: {
					_index : indexName,
					_type : indexType,
					_id:self.id
				}
			});

			bulkQuery.body.push(sDoc);
			++self.id;

		});
		return new promise(function(resolve){
				this.beforeBulkInsert(indexName,indexType)
					.then(function(){
						return this.bulkQuery(bulkQuery);
					}.bind(this))
						.then(function(bulkInsertResp){
							this.afterBulkInsert(indexName,indexType)
								.then(function(){
									resolve(bulkInsertResp);
								})
						}.bind(this));
		}.bind(this));
	},

	bulkQuery:function(bulkQuery){
		return new promise(function(resolve){
			this.client.bulk(bulkQuery, function (err, resp,body) {
				if(err){
					throw err;
					return;
				}
				var bulkInsertResp = this.handleBulkInsertResp(resp,body);
				resolve(bulkInsertResp);
			}.bind(this));
		}.bind(this));
	},

	handleBulkInsertResp:function(resp,status){
		var errorItems = [];
		var status = {};

		if(resp.errors){
			if(resp.items && resp.items.length > 0){
				resp.items.forEach(function(item){
					if(item['index'].status != 201){
						status[item.index.status] = 1;
						errorItems.push(item);
					}
				});

			}
		}
		var bulkInsertResp = {
			'error':(errorItems.length > 0?true:false),
			'total':resp.items.length,
			'errorCount':errorItems.length,
			'errorItems':errorItems
		}
		return bulkInsertResp;
	},

	collateResponses:function(allResp,currResp){
		var finalResp = allResp?{}:currResp;
		if(allResp && currResp){
			finalResp = {
				'error':currResp.error?currResp.error:allResp.error,
				'total':allResp.total + currResp.total,
				'errorCount':allResp.errorCount + currResp.errorCount,
				'errorItems':allResp.errorItems.concat(currResp.errorItems)
			}
		}
		return finalResp;
	}
}
var indBuilder = new IndexBuilder();
module.exports = indBuilder;