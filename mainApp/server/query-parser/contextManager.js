var sc = require('./../../config/config').searchContext;
var config = require('./../../config/config');
var commonUtils = require('../utils/commonUtils');
var logger = require('./../utils/Logger');
var dataSetDB = require('../mongoDB/dataSetsDB');
var ESHelper = require('./ESHelper');
var typeEnum = config.typeEnum;
var ExpressionBuilder = require('./ExpressionBuilder');

var contextManager = function(fileId){
	this.fileId = fileId;
	this.esHelper = new ESHelper();
	this.headerData = null;
	this.getDataSet(function(){

	});
};

contextManager.prototype = {
	getDataSet:function(callback){
		if(this.headerData){
			callback(this.headerData);
		}
		else{
			dataSetDB.getDataSetById(this.fileId)
				.then(function(dataSet){
					this.headerData = dataSet.headers;
					callback(this.headerData);
				}.bind(this));
		}
	},

	getDomainSpecForVal:function(val){
		var domainSpec = {};
		for(var header in fileHeaderJson){
			var context = fileHeaderJson[header];
			if(context.vals[val]){
				domainSpec.type = context.context;
				domainSpec.header = header;
				domainSpec.val = context.vals[val];
				break;
			}
		}
		return domainSpec;
	},

	getKeyFromContextObj:function(textArr,fileId,flgCompare,callback){
		this.getDataSet(function(){
			this.esHelper.runQuery(textArr,this.fileId,function(resObj){
				if(resObj.success){
					this.handleQueryResponse(resObj,textArr,flgCompare,callback);
				}
			}.bind(this));
		}.bind(this));
		
	},

	handleQueryResponse:function(resObj,textArr,flgCompare,callback){
		var res = resObj.results;
		var hits = res.hits.hits;
		var keyValueMap = {};
		var valuesMap = {};
		hits.forEach(function(hit){
			var source = hit._source;
			if(!keyValueMap[source.type]){
				keyValueMap[source.type] = [];
			}
			//console.log(JSON.stringify(hit));
			keyValueMap[source.type].push(source.name);

			var values = source.values;
			values.forEach(function(val){
				var vals = val.split(' ');
				vals.forEach(function(v1){
					valuesMap[v1] = 1;
				});
			});
		});

		var errorMap = this.handleContextNotAvailable(textArr,valuesMap);
		this.handleDomainContexts(keyValueMap);
		callback(keyValueMap,errorMap);
	},

	createQueryMapForAll:function(callback){
		this.getDefaultContextForType(typeEnum.DATE,function(defaultDateDomain){
			var dateDomainType = commonUtils.getDateDomainDateTypeName();
			var numDomainType = commonUtils.getNumberDomainDateTypeName();
			var query = null;
			if(defaultDateDomain){
				query = {};
				query[dateDomainType] = [defaultDateDomain];
			}
			this.getDefaultContextForType(typeEnum.NUMBER,function(defaultNumDomain){
				if(defaultNumDomain){
					if(!query){
						query = {};
					}
					query[numDomainType] = [defaultNumDomain]
				}
				callback(query);
			});

			
		}.bind(this));
	},

	handleContextNotAvailable:function(textArr,keyValueMap){
		var errorMap = {};
		if(textArr && textArr.length > 0){
			textArr.forEach(function(text){
				if(!keyValueMap[text]){
					errorMap[text] = 1;
				}
			});
		}
		return errorMap;
	},

	handleDomainContexts:function(keyValueMap){
		this.getDataSet(function(headerData){
			var headerJsonMap = {};
			if(headerData && headerData.length){
				headerData.forEach(function(headerJson){
					headerJsonMap[headerJson.header] = headerJson;
				});
			}
			var domainType = commonUtils.getDomainBizDataTypeName();
			var dateDomainType = commonUtils.getDateDomainDateTypeName();
			var numDomainType = commonUtils.getNumberDomainDateTypeName();

			var domainTypeKeywords = keyValueMap[domainType];
			if(domainTypeKeywords && domainTypeKeywords.length > 0){
				domainTypeKeywords = JSON.parse(JSON.stringify(domainTypeKeywords));
				delete keyValueMap[domainType];
				domainTypeKeywords.forEach(function(keyWord){
					if(headerJsonMap[keyWord].type == typeEnum.DATE){
						if(!keyValueMap[dateDomainType]){
							keyValueMap[dateDomainType] = [];
						}
						keyValueMap[dateDomainType].push(keyWord);
					}
					else if(headerJsonMap[keyWord].type == typeEnum.NUMBER){
						if(!keyValueMap[numDomainType]){
							keyValueMap[numDomainType] = [];
						}
						keyValueMap[numDomainType].push(keyWord);
					}
					else{
						if(!keyValueMap[domainType]){
							keyValueMap[domainType] = [];
						}
						keyValueMap[domainType].push(keyWord);
					}
				});
			}


			//Check for default values
			var dateDomainTypeKeyWords = keyValueMap[dateDomainType];

			if(!dateDomainTypeKeyWords || dateDomainTypeKeyWords.length == 0){
				this.getDefaultContextForType(typeEnum.DATE,function(defaultDateDomain){
					if(defaultDateDomain){
						keyValueMap[dateDomainType] = [defaultDateDomain];
					}
				});
			}

			var numDomainTypeKeywords = keyValueMap[numDomainType];
			if(!numDomainTypeKeywords || numDomainTypeKeywords.length == 0){
				this.getDefaultContextForType(typeEnum.NUMBER,function(defaultNumDomain){
					if(defaultNumDomain){
						keyValueMap[numDomainType] = [defaultNumDomain];
					}
				});
			}
		}.bind(this));
	},

	getDefaultDateContext:function(callback){
		this.getDefaultContextForType(typeEnum.DATE,function(defaultDateDomain){
			var dateDomainType = commonUtils.getDateDomainDateTypeName();
			var obj = null;
			if(defaultDateDomain){
				obj = {};
				obj[dateDomainType] = defaultDateDomain;
			}
			callback(obj);
		});
	},

	getDefaultNumContext:function(callback){
		this.getDefaultContextForType(typeEnum.NUMBER,function(defaultNumDomain){
			var numDomainType = commonUtils.getNumberDomainDateTypeName();
			var obj = null;
			if(defaultNumDomain){
				obj = {};
				obj[numDomainType] = defaultNumDomain;
			}
			callback(obj);
		});
	},

	getDefaultContextForType:function(type,callback){
		this.getDataSet(function(headerData){
			var defaultDateDomain = null;
			for(var i=0;i<headerData.length;i++){
				if(headerData[i].type == type){
					defaultDateDomain = headerData[i].header;
					break;
				}
			}
			callback(defaultDateDomain);
		});
	},

	handleFilterForTheContexts:function(queryMap,compareMap,timeSpec,callback){
		var self = this;
		var dateDomainType = commonUtils.getDateDomainDateTypeName();
		var dateDomain = null;
		if(queryMap && queryMap[dateDomainType]){
			dateDomain = queryMap[dateDomainType][0];
		}
		else if(compareMap && compareMap.length >0){
			var comparer = compareMap[0];
			var compare = comparer.compare;
			if(compare[dateDomainType]){
				dateDomain = compare[dateDomainType][0];
			}
		}

		if(!dateDomain){
			this.getDefaultContextForType(typeEnum.DATE,function(defaultDateDomain){
				dateDomain = defaultDateDomain;
				createFilterMap(dateDomain,callback);
			});
		}
		else{
			createFilterMap(dateDomain,callback);
		}

		function createFilterMap(dateDomain,cb){
			var filter = null;
			var defaultDateRange = null;
			if(dateDomain){
				self.getDataSet(function(headers){
					if(headers && headers.length >0){
						headers.forEach(function(headerJson){
							if(dateDomain == headerJson.header){
								var expr = new ExpressionBuilder(headerJson);
								if(timeSpec){
									filter = expr.build(timeSpec);
								}
								defaultDateRange = expr.getDateRange();
								cb({filter:filter,defaultDateRange:defaultDateRange});
							}
						});
					}
				});
			}
			else{
				callback({filter:filter,defaultDateRange:defaultDateRange});
			}
		}
	},

};


module.exports = contextManager;

