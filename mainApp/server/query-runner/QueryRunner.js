var elasticsearch = require('elasticsearch');
var ESQueryHelper = require('./ESQueryHelper');
var qb = require('./ESQueryBuilder');
var dtm = require('./../utils/DateTime');
var config = require('./../../config/config');
var logger = require('./../utils/Logger');
var QueryAggregator = require('./QueryAggregator');
var CompareQueryAggregator = require('./CompareQueryAggregator');
var commonUtils = require('../utils/commonUtils');
var _ = require('underscore');

function QueryRunner(fileId,display,timelineField,operator,relationOperator){
	this.init(fileId,display,timelineField,operator,relationOperator);
}

QueryRunner.prototype.init = function(fileId,display,timelineField,operator,relationOperator){
	this.client = new elasticsearch.Client({
		host: config.elasticSearch.url,
		requestTimeout : 1000 * 60 *5,
		keepAlive:false
	});
	this.fileId = fileId;
	this.display = display;
	this.timelineField = timelineField;
	this.operator = operator;
	this.relationOperator = relationOperator;
}

QueryRunner.prototype.getRoot = function(cbOnDone){
	var esQuery = qb.getRootQuery(this.fileId);
	this.client.search(esQuery, function(err, res){
		if(err){
			logger.log(err);
			cbOnDone({success : false, results : 'error in ES query execute'});
		}
		else{
			cbOnDone({success : true, results : res});
		}
	});	
}

QueryRunner.prototype.run = function(antlrQueryObject, cbOnDone){
	var srcFilterMapArr = this.getSourceAndFilterBreakDown(antlrQueryObject);
	this.runQueries(srcFilterMapArr, cbOnDone);
}

QueryRunner.prototype.runQueries = function(srcFilterMaparr,cbOnDone){
	var resp = {success: true, results : []};
	function onComplete(data){
		resp.results.push(data.results);
		if(resp.results.length == srcFilterMaparr.length){
			cbOnDone(resp);
		}
		//return;
	}
	if(srcFilterMaparr && srcFilterMaparr.length > 0){
		srcFilterMaparr.forEach(function(srcFilterMap){
			this.runQuery(srcFilterMap,onComplete);
		}.bind(this));
	}
	else{
		this.runQuery({},function(data){
			resp.results.push(data.results);
			cbOnDone(resp);
		},true);
	}
}

QueryRunner.prototype.runQuery = function(srcFilterMap, cbOnDone,flgAll){
	var qHlpr = new ESQueryHelper(this.fileId);
	var esQuery = qHlpr.getESQuery(srcFilterMap,flgAll,this.relationOperator);
	this.applyAggregatorsToESQuery(esQuery, srcFilterMap,function(esQuery){	
		logger.log(JSON.stringify(esQuery));
		this.client.search(esQuery, function(err, res){
			if(err){
				logger.log(err);
				cbOnDone({success : false, results : 'error in ES query execute'});
			}
			else{
				res.qSource = srcFilterMap.source;
				//res.qTarget = srcTargetFilter.target;
				cbOnDone({success : true, results : res});
			}
		});	
	}.bind(this));
}

QueryRunner.prototype.getSourceAndFilterBreakDown = function(queryAndFilters){
	var arr = [];
	if(queryAndFilters.query || queryAndFilters.compareMap){
		var mainSrcObjs = [];
		var domainSrcObjs = [];
		var dateDomainSrcObjs = [];
		var numDomainSrcObjs = [];
		var querySrcAndDomainObjs = this.getSourceAndDomainForKeyValueMap(queryAndFilters.query);
		if(querySrcAndDomainObjs){
			mainSrcObjs = querySrcAndDomainObjs.srcObjs;
			domainSrcObjs = querySrcAndDomainObjs.domainObjs;
			dateDomainSrcObjs = querySrcAndDomainObjs.dateDomainObjs;
			numDomainSrcObjs = querySrcAndDomainObjs.numDomainObjs;
		}
		var compareMap = queryAndFilters.compareMap;
		if(compareMap && compareMap.length > 0){
			var compareSrcObjs = this.getSourceAndContextsForCompare(compareMap);
			compareSrcObjs.forEach(function(compareSrcContext){
				if(compareSrcContext.srcObj.length > 0){
					arr.push({
						'source':mainSrcObjs.concat(compareSrcContext.srcObj),
						'compareContexts':compareSrcContext.contextKeys,
						filters:queryAndFilters.filters,
						'domain':domainSrcObjs.concat(compareSrcContext.domain),
						'dateDomain':dateDomainSrcObjs.concat(compareSrcContext.dateDomain),
						'numDomain':numDomainSrcObjs.concat(compareSrcContext.numDomain)
					});
				}
			});	
		}
		else{
			arr.push({'source':mainSrcObjs,filters:queryAndFilters.filters,'domain':domainSrcObjs,'dateDomain':dateDomainSrcObjs,'numDomain':numDomainSrcObjs});
		}
	}
	else
		if(queryAndFilters.filters){
			arr.push({source : null, filters : queryAndFilters.filters,'domain':null});
		}

	return arr;
};

QueryRunner.prototype.getSourceAndContextsForCompare = function(compareMap){
	var compares = this.getPossibleCompareCombinations(compareMap);
	var compSrcAndContextObj = [];
	var domainType = commonUtils.getDomainBizDataTypeName();
	var dateDomainType = commonUtils.getDateDomainDateTypeName();
	var numDomainType = commonUtils.getNumberDomainDateTypeName();

	compares.forEach(function(compare){
		var srcObj = this.getSourceAndDomainForKeyValueMap(compare);
		var contextKeys = Object.keys(compare);
		if(contextKeys.indexOf(domainType) != -1){
			contextKeys.splice(contextKeys.indexOf(domainType),1);
		}
		if(contextKeys.indexOf(dateDomainType) != -1){
			contextKeys.splice(contextKeys.indexOf(dateDomainType),1);
		}

		if(contextKeys.indexOf(numDomainType) != -1){
			contextKeys.splice(contextKeys.indexOf(numDomainType),1);
		}
		compSrcAndContextObj.push({
									'srcObj':srcObj.srcObjs,
									'contextKeys':contextKeys,
									'domain':srcObj.domainObjs,
									'dateDomain':srcObj.dateDomainObjs,
									'numDomain':srcObj.numDomainObjs
								});
	}.bind(this));
	return compSrcAndContextObj;
};

QueryRunner.prototype.getPossibleCompareCombinations = function(compareMap){
	var allComparesObj = [];
	compareMap.forEach(function(comparer){
		var compares = [];
		compares.push(comparer.compare);
		compares.push(comparer.with);
		allComparesObj = this.crossProductOfObjs(allComparesObj,compares);
	}.bind(this));
	return allComparesObj;
};

QueryRunner.prototype.crossProductOfObjs=function(allComparesObj,newCompareObjs){
	var finCompareObjs = [];
	newCompareObjs.forEach(function(newCompareObj){
		if(allComparesObj && allComparesObj.length > 0){
			allComparesObj.forEach(function(compareObj){
				var finCompareObj = JSON.parse(JSON.stringify(compareObj));
				for(var key in newCompareObj){
					if(finCompareObj[key]){
						finCompareObj[key] = compareObj[key].concat(newCompareObj[key]);
					}
					else{
						finCompareObj[key] = newCompareObj[key];
					}
				}
				finCompareObjs.push(finCompareObj);
			});
		}
		else{
			finCompareObjs.push(newCompareObj);
		}
	});
	return finCompareObjs;
};

QueryRunner.prototype.getSourceAndDomainForKeyValueMap = function(keyValueMap){
	var srcObjs = [];
	var domainObjs = [];
	var dateDomainObjs = [];
	var numDomainObjs = [];
	if(keyValueMap){
		var keys = Object.keys(keyValueMap);
		var domainType = commonUtils.getDomainBizDataTypeName();
		var dateDomainType = commonUtils.getDateDomainDateTypeName();
		var numDomainType = commonUtils.getNumberDomainDateTypeName();
		if(keys && keys.length > 0){
			keys.forEach(function(key){
				var vals = keyValueMap[key];
				if(domainType == key){
					domainObjs.push({
						key : key,
						values : vals
					});
				}
				else if(dateDomainType == key){
					dateDomainObjs.push({
						key : key,
						values : vals
					});
				}
				else if(numDomainType == key){
					numDomainObjs.push({
						key : key,
						values : vals
					});
				}
				else{
					srcObjs.push({
							key : key,
							values : vals
					});
				}
			});
		}
	}
	return {
			srcObjs:srcObjs,
			domainObjs:domainObjs,
			dateDomainObjs:dateDomainObjs,
			numDomainObjs:numDomainObjs
	};
};


QueryRunner.prototype.applyAggregatorsToESQuery = function(esQuery, srcFilterMap,callback){	
	var agg = new QueryAggregator(this.fileId,srcFilterMap.filters?srcFilterMap.filters.and:null,this.operator);
	if(this.display){
		agg.getAggregatesByDisplay(this.display,this.timelineField,srcFilterMap.numDomain,function(aggObj){
			esQuery.body.aggs = aggObj.aggs;
			callback(esQuery);
		});
	}
	else{
		agg.getAggregates(srcFilterMap.source,srcFilterMap.compareContexts,srcFilterMap.domain,srcFilterMap.dateDomain,srcFilterMap.numDomain,function(aggObj){
			esQuery.body.aggs = aggObj.aggs;
			callback(esQuery);
		});
	}
}

module.exports = QueryRunner;















