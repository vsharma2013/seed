var dateDomain = 'date_domain';
var numDomain = 'num_domain';
var domain = 'domain';
var allDomainKeywords = [dateDomain,numDomain,domain];
(function(NS){
	function ResponseParser (){

	}

	ResponseParser.prototype.parse = function(apiRes){
		var uiObjects = [];
		apiRes.results.forEach((function(result){
			if(result.aggregations){
				var uiObject = this.getUIObjectForAggregation(result.aggregations);
				uiObject.queryDetails = { qSource : result.qSource};
				uiObjects.push(uiObject);
			}
		}).bind(this));
		return uiObjects;
	}

	ResponseParser.prototype.isCompareResponse = function(apiRes){
		if(apiRes.results && apiRes.results.length > 1){
			return true;
		}
		return false;
	}

	ResponseParser.prototype.getAllDisplayTypes = function(apiRes){
		var displays = [];
		apiRes.results.forEach(function(result){
			if(result.aggregations){
				var aggs = result.aggregations;
				displays = displays.concat(Object.keys(aggs));
			}
		});
		var finDisplay = {};
		if(displays && displays.length >0){
			for(var i=0;i<displays.length;i++){
				if(displays[i] != 'domain'){
					finDisplay[displays[i]] = 1;
				}
			}
		}
		return Object.keys(finDisplay);
	}

	ResponseParser.prototype.getDefaultDisplayType = function(apiRes){
		var defDisplay = null;
		if(apiRes.query){
			if(apiRes.query.compareMap && apiRes.query.compareMap.length >0){
				var comparer = apiRes.query.compareMap[0];
				var compare =comparer.compare;
				var keys = Object.keys(compare);
				for(var i=0;i < keys.length;i++){
					var key = keys[i];
					if(allDomainKeywords.indexOf(key) == -1){
						defDisplay = key;
						break;
					}
				};
			}

			if(!defDisplay && apiRes.query.query){
				var keys = Object.keys(apiRes.query.query);
				var parentContext = null;
				for(var i=0;i < keys.length;i++){
					var key = keys[i];
					if(allDomainKeywords.indexOf(key) == -1){
						parentContext = key;
						break;
					}
				};

				if(parentContext){
					var hierarchyData = apiRes.hierarchyData.heararchy;
					if(hierarchyData[parentContext]){
						var childs = hierarchyData[parentContext].childs;
						var keys = Object.keys(childs);
						if(keys && keys.length > 0){
							defDisplay = keys[0];
						}
						else{
							var parents = hierarchyData[parentContext].parents;
							if(parents && parents.length > 0){
								var parent = parents[0];
								var siblings = hierarchyData[parent].childs;
								var keys = Object.keys(siblings);
								if(keys && keys.length > 0){
									for(var i=0;i<keys.length;i++){
										var key = keys[i];
										if(key != parentContext){
											defDisplay = key;
											break;
										}
									}
								}
							}
						}
					}
				}

				if(!defDisplay){
					var domainKeywords = apiRes.query.query[domain];
					if(domainKeywords && domainKeywords.length > 0){
						defDisplay = domainKeywords[0];
					}
				}
			}
		}
		return defDisplay;
	}

	ResponseParser.prototype.getTimeField = function(apiRes){
		var timeField = '';
		if(apiRes.query){
			if(apiRes.query.query){
				var dateDomainQuery = apiRes.query.query[dateDomain];
				if(dateDomainQuery && dateDomainQuery.length > 0){
					timeField = dateDomainQuery[0];
				}
			}

			if(!timeField && apiRes.query.compareMap && apiRes.query.compareMap.length >0){
				var comparer = apiRes.query.compareMap[0];
				var compare =comparer.compare;
				var dateDomainQuery = compare[dateDomain];
				if(dateDomainQuery && dateDomainQuery.length > 0){
					timeField = dateDomainQuery[0];
				}
			}
		}
		return timeField;
	}

	ResponseParser.prototype.getUIObjectForAggregation = function(agg){
		var uiObject = {};
		var i = 1;
		Object.keys(agg).forEach((function(a){
			var k = 'key' + i;
			uiObject[k] = {};
			this.addNodesRecurssive(uiObject[k], agg[a], a);
			i++;
		}).bind(this));
		return uiObject;
	}

	ResponseParser.prototype.addNodesRecurssive = function(obj, apiObj, strRootKey){
		var self = this;
		obj.key = strRootKey;
		obj.items = [];
		if(apiObj.buckets){
			apiObj.buckets.forEach(function(bucket){
				var bKeys = Object.keys(bucket);
				var item = { key : '', items : [] };	
				bKeys.forEach(function(bKey){
					if(bKey == 'operator'){
						item['doc_count'] = bucket[bKey].value;
					}												
					else if(typeof(bucket[bKey]) === 'object'){
						var t = {key : ''};
						item.items.push(t);
						var items = bucket[bKey];
						if(bucket[bKey][bKey]){
							items = bucket[bKey][bKey];
						}
						self.addNodesRecurssive(t, items, bKey);
					}
					else
						item[bKey] = bucket[bKey];				
				});	
				obj.items.push(item);			
			});
		}
	}
	NS.ResponseParser = ResponseParser;
})(window);