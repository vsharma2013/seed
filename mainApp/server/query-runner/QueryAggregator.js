var sc = require('./../../config/config').searchContext;
var hierarchyDB = require('../mongoDB/hierarchyDB');
var PostProcessAggregator = require('./ESPostProcessAggregator');

function QueryAggreagator(fileId,filters,operator){
	this.fileId  = fileId;
	this.headerHierarchies = {};
	this.filters = filters;
	this.init();
	this.postProcessor = new PostProcessAggregator(operator);
}

QueryAggreagator.prototype.setHeaderHierarchies = function(callback){
	var fileId = this.fileId;
	hierarchyDB.getHierarchyDoc(fileId)
		.done(function(docs){
			this.headerHierarchies = docs[0].heararchy;
			/*fileHeaderJson = {};
			var count = 1;
			rows.forEach(function(row){
				row.hiear = count;
				headerHierarchies[row.header] = row;
				fileHeaderJson[row.id] = {context: row.header};
				count++;
			});*/
			callback();
		}.bind(this));
};

QueryAggreagator.prototype.getAggregatesByHierarchy = function(source,compareContexts,domainQuery,dateDomainQuery,numbDomain){
	var aggs = {'aggs':{}};
	var parentDomainMap = this.getAllParentsForDomainObj(domainQuery);
	var finSrc = source && source.length >0?source:this.convertDomainToSource(domainQuery);
	if(finSrc && finSrc.length > 0){
		for(var i=0;i<finSrc.length;i++){
			var srckey = finSrc[i].key;
			var keyAggs = null;
			if(parentDomainMap[srckey]){
				var keys = parentDomainMap[srckey];
				keys.forEach(function(key){
					var keyHierar = this.headerHierarchies[key];
					var linkedKey = {};
					linkedKey[key] = keyHierar;
					keyAggs = this.getAllAggregatesByKey(linkedKey);
					if(keyAggs){
						for(var aggName in keyAggs){
							aggs.aggs[aggName] = keyAggs[aggName];
						} 
					}
					var siblingAggs = this.getAllAggForSiblings(key,finSrc);
					siblingAggs.forEach(function(keyAggs){
						if(keyAggs){
							for(var aggName in keyAggs){
								aggs.aggs[aggName] = keyAggs[aggName];
							} 
						}
					});
				}.bind(this));
			}
			else{
				var key = srckey;
				var keyHierar = this.headerHierarchies[key];
				if(keyHierar){
					var linkedKey = keyHierar.childs && Object.keys(keyHierar.childs).length > 0? keyHierar.childs:null;
					keyAggs = this.getAllAggregatesByKey(linkedKey);
				}
				if(keyAggs){
					for(var aggName in keyAggs){
						aggs.aggs[aggName] = keyAggs[aggName];
					} 
				}

				var siblingAggs = this.getAllAggForSiblings(key,finSrc);
				siblingAggs.forEach(function(keyAggs){
					if(keyAggs){
						for(var aggName in keyAggs){
							aggs.aggs[aggName] = keyAggs[aggName];
						} 
					}
				});
			}
			
		}

		if(compareContexts && compareContexts.length > 0){
			compareContexts.forEach(function(compContext){
				aggs.aggs[compContext] = {
					terms : {
						field : compContext,
						size : 50
					},
					aggs : {}
				}
			});
		}
	}
	
	var keyAggs = this.getAggregrationForOtherRootParent(finSrc,parentDomainMap);
	if(keyAggs){
		for(var aggName in keyAggs){
			aggs.aggs[aggName] = keyAggs[aggName];
		} 
	}

	/*if(parentDomainMap){
		console.log(JSON.stringify(parentDomainMap),'test3');
		for(var parent in parentDomainMap){
			var domainVals = parentDomainMap[parent];
			domainVals.forEach(function(domainVal){
				if(!aggs.aggs[domainVal]){
					var keyHierar = this.headerHierarchies[domainVal];
					var linkedKey = {};
					linkedKey[domainVal] = keyHierar;
					var keyAggs = this.getAllAggregatesByKey(linkedKey);
					if(keyAggs){
						for(var aggName in keyAggs){
							aggs.aggs[aggName] = keyAggs[aggName];
						} 
					}
				}
			}.bind(this));
		}
	}*/
	this.postProcessor.addPostProcessAggregation(aggs,numbDomain);
	this.addTimeAggregate(aggs,dateDomainQuery,numbDomain);
	return aggs;
};

QueryAggreagator.prototype.getAggregatesByHierarchyByDisplay = function(display,timeLineField,numbDomain){
	var aggs = {'aggs':{}};
	var keyHierar = this.headerHierarchies[display];
	if(keyHierar){
		var linkedKey = {};
		linkedKey[display] = keyHierar;
		var keyAggs = this.getAllAggregatesByKey(linkedKey);
		if(keyAggs){
			for(var aggName in keyAggs){
				aggs.aggs[aggName] = keyAggs[aggName];
			} 
		}
	}
	this.postProcessor.addPostProcessAggregation(aggs,numbDomain);
	if(timeLineField){
		var domainFields = [];
		var timeLine = {
			values:[timeLineField]
		};
		domainFields.push(timeLine);
		this.addTimeAggregate(aggs,domainFields,numbDomain)
	}
	return aggs;
};


QueryAggreagator.prototype.getAggregrationForOtherRootParent = function(finSrc,parentDomainMap){
	var additionalParents = this.handleAdditionalHiearchyParentAgg(finSrc,parentDomainMap);
	var keyAggs = null;
	if(additionalParents){
		var keyAggs = this.getAllAggregatesByKey(additionalParents);
	}
	return keyAggs;
};

QueryAggreagator.prototype.convertDomainToSource = function(domainQuery){
	var source = [];
	if(domainQuery && domainQuery.length > 0){
		domainQuery.forEach(function(dom){
			var values = dom.values;
			values.forEach(function(val){
				source.push({
					key:val,
					values:[]
				})
			});
		});
	}
	else{
		return null;
	}
	return source;
};

QueryAggreagator.prototype.getAllParentsForDomainObj = function(domain){
	var parentDomainMap = {};
	if(domain && domain.length > 0){
		var domainParentMap = {};
		domain.forEach(function(dom){
			var values = dom.values;
			values.forEach(function(val){
				var parents = this.getAllParentsForDom(val);
				if(parents){
					domainParentMap[val] = parents;
				}
			}.bind(this));
		}.bind(this))

		for(var dom in domainParentMap){
			var parents = domainParentMap[dom];
			if(parents && parents.length > 0){
				parents.forEach(function(parent){
					if(!parentDomainMap[parent]){
						parentDomainMap[parent] = [];
					}
					parentDomainMap[parent].push(dom);
				});
			}
		}
	}
	return parentDomainMap;
};

QueryAggreagator.prototype.getAllAggForSiblings = function(key,src){
	var siblingsAggs = [];
	var srcKeyMap = {};
	if(src && src.length > 0){
		src.forEach(function(s){
			srcKeyMap[s.key] = 1;
		});
	}
	var siblings = this.getAllSiblingsForContext(key);
	if(siblings && siblings.length >0){
		console.log(src);
		siblings.forEach(function(sibling){
			if(srcKeyMap[sibling]){
				
			}
			else{
				var keyHierar = this.headerHierarchies[sibling];
				var linkedKey = {};
				linkedKey[sibling] = keyHierar;
				var keyAggs = this.getAllAggregatesByKey(linkedKey);
				siblingsAggs.push(keyAggs);
			}
		}.bind(this));
	}
	return siblingsAggs;
};

QueryAggreagator.prototype.getAllSiblingsForContext = function(context){
	var siblings = [];
	var parents = this.headerHierarchies[context].parents;
	if(parents && parents.length > 0){
		parents.forEach(function(parent){
			if(this.headerHierarchies[parent]){
				var childMap = this.headerHierarchies[parent].childs;
				var childKeys = Object.keys(childMap);
				childKeys.splice(childKeys.indexOf(context),1);
				siblings = siblings.concat(childKeys);
			}
		}.bind(this));
	}
	return siblings;
};

QueryAggreagator.prototype.handleAdditionalHiearchyParentAgg = function(sources,parentDomainMap){
	var allParentsInHier = this.getAllParentHier();
	var currHier = [];
	var sourceInDomainMap = false;
	if(sources && sources.length > 0){
		sources.forEach(function(source){
			var key = source.key;
			currHier = currHier.concat(this.getRootNodesForKey(key));
		}.bind(this));
	}

	var additionalParents = {};

	for(var i=0;i<allParentsInHier.length;i++){
		if(currHier.indexOf(allParentsInHier[i]) == -1){
			var key = allParentsInHier[i];
			var domainKeys = parentDomainMap[key]?parentDomainMap[key]:[key];
			domainKeys.forEach(function(domainKey){
				additionalParents[domainKey] = this.headerHierarchies[domainKey];
			}.bind(this));
		}
	}
	return additionalParents;
};

QueryAggreagator.prototype.getAllParentHier = function(){
	var parents = [];
	for(var header in this.headerHierarchies){
		var hierarchy = this.headerHierarchies[header];
		if(hierarchy.parents && hierarchy.parents.length == 0){
			parents.push(header);
		}
	}
	return parents;
};

QueryAggreagator.prototype.getRootNodesForKey = function(key){
	var keyHier = this.headerHierarchies[key];
	var parents = keyHier.parents;
	var parentKey = [];
	if(parents && parents.length > 0){
		parents.forEach(function(parent){
			parentKey = this.getRootNodesForKey(parent);
		}.bind(this));
	}
	else{
		return [key];
	}
	return parentKey;
};

QueryAggreagator.prototype.getAllParentsForDom=function(key){
	var keyHier = this.headerHierarchies[key];
	var allParents = [];
	if(keyHier){
		var parents = keyHier.parents;
		if(parents && parents.length > 0){
			parents.forEach(function(parent){
				var keyParents = this.getAllParentsForDom(parent);
				allParents = allParents.concat(keyParents);
				allParents.push(parent);
			}.bind(this));
		}
		else{
			allParents.push(key);
		}
	}
	return allParents;
};

QueryAggreagator.prototype.getAllAggregatesByKey = function(childs){
	var aggs = {};
	if(childs){
		var childKeys = Object.keys(childs);
		if(childKeys && childKeys.length > 0){
			for(var childContext in childs){
				var childObject = childs[childContext];
				var linkedChilds = childObject.childs && Object.keys(childObject.childs).length > 0? childObject.childs:null;
				aggs[childContext] = {
					terms : {
						field : childContext,
						size : 50
					},
					aggs : (linkedChilds?this.getAllAggregatesByKey(linkedChilds):{})
				}
			}
			return aggs;
		}else{
			return null;
		}
	}
	return null;
};

QueryAggreagator.prototype.getAggregates = function(query,compareContexts,domainQuery,dateDomainQuery,numDomain,callback){
	this.setHeaderHierarchies(function(){
		var aggobj = this.getAggregatesByHierarchy(query,compareContexts,domainQuery,dateDomainQuery,numDomain);
		callback(aggobj);
	}.bind(this)); 
}

QueryAggreagator.prototype.getAggregatesByDisplay = function(display,timelineField,numDomain,callback){
	this.setHeaderHierarchies(function(){
		var aggobj = this.getAggregatesByHierarchyByDisplay(display,timelineField,numDomain);
		callback(aggobj);
	}.bind(this)); 
}

QueryAggreagator.prototype.init = function(){
	this.hasDates = false;
	if(!this.filters) return;

	this.filterNames = [];
	this.filters.forEach((function(f){
		this.filterNames.push(f.filter.name);
		if(!this.hasDates && f.filter.isDate)
			this.hasDates = true;
	}).bind(this));
}

QueryAggreagator.prototype.addTimeAggregate = function(agg,dateDomain,numbDomain){
	if(!agg.aggs) return;
	if(Object.keys(agg.aggs).length === 0) return;
	var root = agg.aggs;
	var dateDomainField = null;
	if(dateDomain && dateDomain.length > 0){
		dateDomainField = dateDomain[0].values?dateDomain[0].values[0]:null;
	}
	if(dateDomainField){
		Object.keys(root).forEach((function(k){
			var t = this.getTimeAggregate(dateDomainField);
			if(t){
				var tKey = Object.keys(t)[0];
				if(root[k].aggs){
					this.postProcessor.addPostProcessAggregation(t[tKey],numbDomain);
					root[k].aggs[tKey] = t[tKey];
				}
			}
		}).bind(this));
	}

}

QueryAggreagator.prototype.getTimeAggregate = function(dateDomainField){
	if(!dateDomainField){
		return;
	}
	if(!this.hasDates)
		return this.getYearlyTimeAgg(dateDomainField);
	var tDiff = this.getTimeDiffData();
	if(tDiff.isLT2Months)
		return this.getDailyTimeAgg(dateDomainField);

	if(!tDiff.isGT1Year)
		return this.getMonthlyTimeAgg(dateDomainField);

	return this.getYearlyTimeAgg(dateDomainField);
}


QueryAggreagator.prototype.getTimeDiffData = function(){
	var dates = [];
	this.filters.forEach(function(f){
		if(f.filter.isDate)
			dates.push(new Date(f.filter.value));
	});
	var dStart = dates[1] > dates[0] ? dates[0] : dates[1];
	var dEnd = dates[1] > dates[0] ? dates[1] : dates[0];
	var dMs = dEnd - dStart;
	var dDays = dMs/(1000 * 60 * 60 * 24);
	var daysIn1Year = 366;

	return {
		isGT1Year : dDays >= daysIn1Year,
		isLT2Months : dDays < 61
	}
}

QueryAggreagator.prototype.getYearlyTimeAgg = function(dateDomainField){
	return {
		yearly : {
			filter:{
				"exists" : { "field" : dateDomainField+'_mod' }
			},
			aggs:{
				'yearly':{
					date_histogram : {
						field : dateDomainField+'_mod',
						interval : 'year',
						format : 'YYYY/MM/DD'
					},
					aggs:{}
				}
			}
		}
	}	

}

QueryAggreagator.prototype.getMonthlyTimeAgg = function(dateDomainField){
	return {
		monthly : {
			filter:{
				"exists" : { "field" : dateDomainField+'_mod' }
			},
			aggs:{
				'monthly':{
					date_histogram : {
						field : dateDomainField+'_mod',
						interval : 'month',
						format : 'YYYY/MM/DD'
					},
					aggs:{}
				}
			}
		}
	}

}

QueryAggreagator.prototype.getDailyTimeAgg = function(dateDomainField){
	return {
		daily : {
			filter:{
				"exists" : { "field" : dateDomainField+'_mod' }
			},
			aggs:{
				daily : {
					date_histogram : {
						field : dateDomainField+'_mod',
						interval : 'day',
						format : 'YYYY/MM/DD'
					},
					aggs:{}
				}
			}
		}
	}

}


module.exports = QueryAggreagator;