(function(NS){
	var responseParser = NS.ResponseParser;
	var ModelFactory = NS.ModelFactory;
	var chartTypeDict = NS.uiComponentDictionary;
	var utils = NS.utils;
	var serviceRouter = NS.serviceRouter;

	var chartModel = (function(){
		var model = function(data,resultData){
			var modelData = data;
			var modelCallback = null;
			var responseFrames = null;
			var isCompare = false;
			var recordsCount = 0;

			var privateFn = {
				preparePanelQuery:function(){
					var queryStr = modelData.queryStr;
					var fileId = modelData.dataId;
					var display = modelData.display;
					var timeField = modelData.timeField;
					var query = modelData.query;
					if(!resultData){
						if(query){
							serviceRouter.searchQueryObjByDisplay(fileId,query,display,timeField,privateFn.onQueryResponse.bind(this));
						}
						else{
							serviceRouter.searchTextByDisplay(queryStr,fileId,display,timeField,privateFn.onQueryResponse.bind(this));
						}
					}
					else{
						this.onQueryResponse(resultData);
					}
				},

				onQueryResponse:function(result){
					resultData = result;
					if(this.handleFailCase()){
						this.setIsCompare();
						this.calcTotalRecords();
						var modelFactory = new NS.ModelFactory();
						var frames = modelFactory.getFrameModel(result,this.getModelOptions(result),modelData.display,isCompare);
						responseFrames = frames;
						modelCallback();
					}
				},

				calcTotalRecords:function(){
					recordsCount = 0;
					resultData.results.forEach(function(result){
						if(result.hits){
						   recordsCount += result.hits.total;
						}
					});
				},

				handleFailCase:function(){
					var success = resultData.success;
					if(success == 0){
						return false;
					}
					return true;
				},

				getErrorMapFromQuery:function(){
					var unrecognizedKeys = [];
					var query = resultData.query;
					var errorMap = query.errorMap;
					if(errorMap){
						unrecognizedKeys = Object.keys(errorMap);
					}
					return unrecognizedKeys;
				},

				setIsCompare:function(){
					if(resultData.results && resultData.results.length > 1){
						isCompare = true;
					}
				},

				getDataForCompareChart:function(){
					var data = null;
					var colors = utils.getDefaultColors();
					var keys = Object.keys(responseFrames);

					if(keys && keys.length > 0){
						var key = keys[0];
						data = [];
						var frame = responseFrames[key];
						var sectors = frame.sectors;
						var resultCount = 0;
						for(var sector in sectors){
							var t = sectors[sector];
							data.push({
								label : t.label,
								value : t.count,
								color : colors.pop()
							});
							resultCount += t.count;
						}
					}
					return data;
				},

				getDataForChart:function(){
					var data = null;
					var colors = utils.getDefaultColors();
					
					if(responseFrames && responseFrames.length > 0){
						var frame = responseFrames[0];
						var container = frame.container;
						data = [];
						var resultCount = 0;
						container.sectors.top.forEach(function(t){
							data.push({
								label : t.key,
								value : t.count,
								color : colors.pop()
							});
							resultCount += t.count;
						});
						if(container.sectors.othersCount > 0){
							var otherVals = [];
							container.sectors.others.forEach((function(o){
								otherVals.push(o.key);
							}).bind(this));

							data.push({
								label : "Others",
								value : container.sectors.othersCount,
								color : colors.pop(),
								keys:otherVals
							});
							resultCount += container.sectors.othersCount;
						}
					}
					return data;
				},

				getModelOptions:function(apiRes){
					var chartSettings = modelData.chartSettings;

					var dd = this.getDateDetails(apiRes);
					return {
						container : {
							width : chartSettings.w,
							height : chartSettings.h
						},
						timeline : {			
							startDate : dd.startDate,
							endDate : dd.endDate,
							dateDist : dd.dist,
							width : isCompare?chartSettings.w - 70:chartSettings.w,
							height : chartSettings.h - 80,
						}
					};
				},

				getDateDetails:function(results){
					var dateRange = results.query?results.query.dateRange:null;
					var details = null;
					if(dateRange){
						details = { 
							startDate : dateRange.startDate,
							endDate : dateRange.endDate,
							dist : 'yearly'
						}
					}
					else{
						details = { 
								startDate : '2000/01/01',
								endDate : '2014/12/31',
								dist : 'yearly'
						}
					}

					if(results.query.filters){
						var arr = [];
						var filters = results.query.filters.and.concat(results.query.filters.or?results.query.filters.or:[]);
						filters.forEach(function(f){
							if(f.filter.isDate){
								arr.push(f.filter.value);
							}
						});

						if(arr.length >= 2){
							details = {
								startDate : arr[0],
								endDate : arr[1],
								dist : 'yearly'
							};
						}
					}

					var diff = new Date(details.endDate) - new Date (details.startDate);
					var dDays = diff/(1000 * 60 * 60 * 24);

					if(dDays < 61)
						details.dist = 'daily'
					else if(dDays < 366)
						details.dist = 'monthly'

					return details;
				},

				getDataByChartType:function(){
					var data = null;
					var chartType=  parseInt(modelData.chartType);
					switch(chartType){
						case chartTypeDict.PIE3D:
							if(isCompare){
								data = this.getDataForCompareChart();
							}
							else{
								data = this.getDataForChart();
							}
							break;
						case chartTypeDict.BAR:
							data = responseFrames[0]?responseFrames[0].timeline:null;
							break;
						case chartTypeDict.LINE:
							data = [];
							var keys = Object.keys(responseFrames);
							if(keys && keys.length > 0){
								var key = keys[0];
								data = responseFrames[key].timelines;
							}
							break;
						case chartTypeDict.DESCRETEBAR:
							data = responseFrames;
							break;
						default:
							data = responseFrames;
							break;
					}
					return data;
				},

				executeSearchOnDrillDown:function(queryParams){
					if(resultData){
						var query = JSON.parse(JSON.stringify(resultData.query));
						var hierarchy = resultData.hierarchyData;
						var chartType=  parseInt(modelData.chartType);
						query.query = this.getQueryObject(query,queryParams,hierarchy);
						query.filters = this.getFilterObject(query,queryParams);
						var queryStr = this.getQueryStrByQueryObj(query);
						return {query:query,queryStr:queryStr};
					}
					return null;
				},

				/*executeSearchOnDrillDown:function(queryParams){
					var queryStr = null;
					
					if(resultData){
						var qSource = resultData.results[0].qSource;
						var hierarchy = resultData.hierarchyData;
						var chartType=  parseInt(modelData.chartType);
						var domain = resultData.query.query?resultData.query.query.domain:null;
						var dateDomain = resultData.query.query?resultData.query.query.date_domain:null;
						switch(chartType){
							case chartTypeDict.PIE3D:
								var filters  = resultData.query.filters? resultData.query.filters.and : null;
								queryStr = this.getQueryString(queryParams, qSource, filters,hierarchy,domain,dateDomain);
								break;
							case chartTypeDict.BAR:
								queryStr = this.getQueryString(queryParams, qSource, null,hierarchy,domain,dateDomain);
								queryStr += this.getTimeFilterSuffix(queryParams);
								break;
						}
					}
					else{
						console.log('no result data found');
					}
					return queryStr;
				},*/

				getQueryStrForPanel:function(){
					var queryObj = resultData.query;
					return this.getQueryStrByQueryObj(queryObj);
				},

				getQueryStrByQueryObj:function(queryObj){
					var parms = [];
					var domainKeys = [];
					var dateDomain = [];
					var numDomain = [];
					var query = queryObj.query;
					var compareMap = queryObj.compareMap;
					var operator = queryObj.operator;
					var relationOperator = queryObj.relationOperator;

					if(query){
						for(var key in query){
							if(key == 'domain'){
								var values = query[key];
								domainKeys.push(values.join(','))
							}
							else if(key == 'date_domain'){
								var values = query[key];
								dateDomain = [values[0]];
							}
							else if(key == 'num_domain'){
								var values = query[key];
								numDomain = [values[0]];
							}
							else{
								parms.push(query[key].join(','));
							}
						}
					}

					if(compareMap && compareMap.length > 0){
						compareMap.forEach(function(comparer){
							var compare = comparer.compare;
							var withComp = comparer.with;

							for(var key in compare){
								if(key == 'domain'){
									var values = compare[key];
									domainKeys.push(values.join(','))
								}
								else if(key == 'date_domain'){
									var values = compare[key];
									dateDomain = [values[0]];
								}
								else if(key == 'num_domain'){
									var values = compare[key];
									numDomain = [values[0]];
								}
								else{
									var withKey = withComp[key];
									var compareKey = compare[key];
									if(withKey && compareKey){
										parms.push(compareKey.join(',') + ' vs ' + withKey.join(','));
									}
								}
							}
						});
					}

					var q = '';

					if(operator){
						q += operator + ' of ';
						if(operator.toLowerCase() != 'count'){
							if(numDomain && numDomain.length >0){
								var d = numDomain.join(' by ');
								q += d + ' for ';
							}
						}
					}
					if(parms && parms.length > 0){
						q += parms.join(' in ');
					}
					else{
						q += 'all';
					}

					if(domainKeys && domainKeys.length > 0){
						var d = domainKeys.join(' by ');
						q += ' by ' + d;
					}

					if(dateDomain && dateDomain.length > 0){
						var d = dateDomain.join(' by ');
						q += ' by ' + d;
					}

					if(relationOperator && relationOperator.length > 0){
						relationOperator.forEach(function(relationOper){
							var text = relationOper.relation;
							var num = relationOper.val;
							q += ' ' + text + ' ' + num;
						});
					}

					var filters = queryObj.filters;
					if(filters){
						var andFilters = filters.and;
						if(andFilters && andFilters.length > 0){
							q += (' between ' + andFilters[0].filter.value + ' and ' + andFilters[1].filter.value);
						}
					}

					return q;
				},

				getQueryObject:function(queryObj,queryParams,hierarchyData){
					var qSource = queryObj.query;
					if(!queryParams.label){
						return qSource;
					}
					var allQueryParents = this.getAllParentsByKey(queryParams.type,hierarchyData);
					
					var isSourceType = false;
					for(var key in qSource){
						if(key == queryParams.type || allQueryParents.indexOf(key) != -1){
							isSourceType = true;
							delete qSource[key];
						}
					}
					qSource[queryParams.type] = [queryParams.label];
					return qSource;
				},

				getFilterObject:function(queryObj,queryParams){
					var filters = queryObj.filters;
					var map = {
						'Jan' : { m : 1, d : 31},
						'Feb' : { m : 2, d : 28},
						'Mar' : { m : 3, d : 31},
						'Apr' : { m : 4, d : 30},
						'May' : { m : 5, d : 31},
						'Jun' : { m : 6, d : 30},
						'Jul' : { m : 7, d : 31},
						'Aug' : { m : 8, d : 31},
						'Sep' : { m : 9, d : 30},
						'Oct' : { m : 10, d : 31},
						'Nov' : { m : 11, d : 30},
						'Dec' : { m : 12, d : 31}
					};
					
					if(queryParams.tKey){
						if(!filters){
							filters = {
								and:[],
								or:[]
							};

							filters.and.push({
								"filter":{
									'name':"date",
									'operator':"from",
									"value":'',
									"isDate":true,
									"dist":"yearly"
								}
							});

							filters.and.push({
								"filter":{
									'name':"date",
									'operator':"to",
									"value":'',
									"isDate":true,
									"dist":"yearly"
								}
							});

						}
						var and = filters.and;
						if(queryParams.tKey){
							var d1 = null;
							var d2 = null;
							if(queryParams.tKey.indexOf('-') !== -1){
								var arr = queryParams.tKey.split('-');
								var year = 2000 + parseInt(arr[1]);
								var month = map[arr[0]].m;
								var date = map[arr[0]].d;
								d1 = year + '/' + month + '/01';
								d2 = year + '/' + month + '/' + date;
							}
							else{
								d1 = queryParams.tKey + '/01/01';
								d2 = queryParams.tKey + '/12/31';
							}
							var filter1 = and[0].filter;
							var filter2 = and[1].filter;
							filter1.value = d1;
							filter2.value = d2;
							if(filter1.dist == "yearly"){
								filter1.dist = "monthly";
								filter2.dist = "monthly";
							}
							else if(filter1.dist == "monthly"){
								filter1.dist = "daily";
								filter2.dist = "daily";
							}
						}
					}
					return filters;
				},

				getQueryString:function(queryParams, qSource, filters,hierarchyData,domainKeys,dateDomain){
					var parms = [];
					var isSourceType  = false;
					var allQueryParents = this.getAllParentsByKey(queryParams.type,hierarchyData);
					if(qSource && qSource.length > 0){
						for(var i=0;i<qSource.length;i++){
							if(qSource[i].key == queryParams.type || allQueryParents.indexOf(qSource[i].key) != -1){
								isSourceType = true;
							}
							else{
								parms.push(qSource[i].values.join(','));
							}
						}
					}
					//if(!isSourceType){
					parms.push(queryParams.label);
					//}

					var q = parms.join(' in ');

					if(domainKeys && domainKeys.length > 0){
						var d = domainKeys.join(' by ');
						q += ' by ' + d;
					}

					if(dateDomain && dateDomain.length > 0){
						var d = dateDomain.join(' by ');
						q += ' by ' + d;
					}
					if(filters && filters.length > 1){
						q += (' between ' + filters[0].filter.value + ' and ' + filters[1].filter.value);
					}

					return q;
				},

				getAllParentsByKey:function(key,hierarchyData){
					var keyHierarchy = hierarchyData.heararchy[key];
					var allParents = [];
					if(keyHierarchy){
						var parents = keyHierarchy.parents;
						if(parents && parents.length >0){
							for(var i=0;i<parents.length;i++){
								var pParents = this.getAllParentsByKey(parents[i],hierarchyData);
								var parentHierarchy = hierarchyData.heararchy[parents[i]];
								var parentChilds = Object.keys(parentHierarchy.childs);
								if(parentChilds && parentChilds.indexOf(key) != -1){
									parentChilds.splice(parentChilds.indexOf(key),1);
								}
								allParents = allParents.concat(pParents);
								allParents = allParents.concat(parentChilds);
								allParents.push(parents[i]);
							}
						}
						
					}
					return allParents;
				},

				getTimeFilterSuffix :function(queryParams){
					var map = {
						'Jan' : { m : 1, d : 31},
						'Feb' : { m : 2, d : 28},
						'Mar' : { m : 3, d : 31},
						'Apr' : { m : 4, d : 30},
						'May' : { m : 5, d : 31},
						'Jun' : { m : 6, d : 30},
						'Jul' : { m : 7, d : 31},
						'Aug' : { m : 8, d : 31},
						'Sep' : { m : 9, d : 30},
						'Oct' : { m : 10, d : 31},
						'Nov' : { m : 11, d : 30},
						'Dec' : { m : 12, d : 31}
					};
					if(queryParams.tKey.indexOf('-') !== -1){
						var arr = queryParams.tKey.split('-');
						var year = 2000 + parseInt(arr[1]);
						var month = map[arr[0]].m;
						var date = map[arr[0]].d;
						return ' between ' + year + '/' + month + '/01 and ' + year + '/' + month + '/' + date;
					}
					else{
						return ' between ' + queryParams.tKey + '/01/01 and ' + queryParams.tKey + '/12/31';
					}
				}
			};

			this.init = function(callback){
				modelCallback = callback;
				privateFn.preparePanelQuery();
			}

			this.getDataForChart = function(){
				return privateFn.getDataByChartType();
			}

			this.getDataId = function(){
				return modelData.dataId;
			};

			this.getDisplay = function(){
				return modelData.display;
			};

			this.isCompareQuery = function(){
				return isCompare;
			}

			this.executeSearchOnDrillDown = function(params){
				return privateFn.executeSearchOnDrillDown(params);
			}

			this.getQueryStrForPanel = function(){
				return privateFn.getQueryStrForPanel();
			}

			this.getErrorMapFromQuery = function(){
				return privateFn.getErrorMapFromQuery();
			}

			this.getRecordsCount = function(){
				return recordsCount
			}
		}
		return model;
	})();

	NS.chartModel = chartModel;
})(window);