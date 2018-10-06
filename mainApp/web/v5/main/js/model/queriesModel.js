(function(NS){
	var utils = NS.utils;
	var serviceRouter = NS.serviceRouter;

	var queriesModel = (function(){
		var model = function(data){
			var modelData = data;
			var qbResultsMap = {};

			sort();

			function sort(){
				modelData.sort(function(a,b){
					return (new Date(a.createdDate)) - (new Date(b.createdDate));
				})
			}
			
			this.getAllQueryData = function(){
				return modelData;
			}

			this.getQueriesByDataSetId = function(dataSetId){
				var queries = [];
				if(modelData && modelData.length > 0){
					for(var i=0;i<modelData.length;i++){
						var query = modelData[i];
						if(query.dataId == dataSetId){
							queries.push(query);
						}
					}
				}
				queries.reverse();
				var ret = queries.splice(0,20);
				return ret;
			}

			this.getQueriesById = function(id){
				if(modelData && modelData.length > 0){
					for(var i=0;i<modelData.length;i++){
						var query = modelData[i];
						if(query.id == id){
							return query;
						}
					}
				}
				return null;
			};

			this.deleteQueriesByDataId = function(dataId){
				if(modelData && modelData.length > 0){
					for(var i=0;i<modelData.length;i++){
						var query = modelData[i];
						if(query.dataId == dataId){
							modelData.splice(i,1);
							i--;
						}
					}
				}
			};

			this.getQueryByText = function(queryStr,dataSetId){
				if(modelData && modelData.length > 0){
					for(var i=0;i<modelData.length;i++){
						var query = modelData[i];
						if(query.queryStr == queryStr && query.dataId == dataSetId){
							return query;
						}
					}
				}
				return null;
			},

			this.handleTextQuery =	function(dataSetId,queryStr,queryObj){
				var query = this.getQueryByText(queryStr,dataSetId);
				if(!query){
					var query = {
						id:utils.getUUId(),
						queryStr:queryStr,
						query:queryObj,
						dataId:dataSetId
					};

					modelData.push(query);
					serviceRouter.saveQueryData(query,function(){

					});
				}
				return query;
			},

			this.setQueryResults = function(id,results){
				qbResultsMap[id] = results;
			}

			this.getQueryResults = function(id,callback){
				var query = this.getQueriesById(id);
				var queryStr = query.queryStr;
				var fileId = query.dataId;
				if(!qbResultsMap[id]){
					if(query.query){
						getQueryResultByQueryObject(query.query,fileId, this.getQueryResultsCallback.bind(this,id,callback));
					}
					else{
						getQueryResultByQueryStr(queryStr,fileId, this.getQueryResultsCallback.bind(this,id,callback));
					}
				}
				else{
				 	callback(qbResultsMap[id]);
				}
			}

			this.getQueryResultsCallback = function(id,callback,result){
				this.setQueryResults(id,result);
				callback(result);
			}

			function getQueryResultByQueryStr(queryStr,fileId,callback){
				serviceRouter.searchText(queryStr,fileId,callback);
			}

			function getQueryResultByQueryObject(queryObj,fileId,callback){
				serviceRouter.searchQueryObj(fileId,queryObj,callback);
			}
		}
		return model;
	})();
	NS.queriesModel = queriesModel;
})(window);