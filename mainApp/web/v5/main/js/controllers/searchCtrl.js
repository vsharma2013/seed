(function(NS,routie){
	var serviceRouter = NS.serviceRouter;
	var queriesModel = NS.queriesModel;
	var searchMainView = NS.searchMainView;
	var userModel = NS.userModel;
	
	var searchCtrl = (function(){
		var ctrl = function(options){
			var ctrlModel = null;
			var ctrlOptions = options;
			var ctrlView = null;
			var userQueriesObj = null;
			var currentQueryId = null;
			var currentDisplay = null;
			var currentSearchtext = null;
			var currentQueryObj = null;

			var privateFn = {
				loadQueryDataForUser:function(callback){
					if(!userQueriesObj){
						serviceRouter.getQueriesData(function(allData){
							this.createUserQueryObj(allData);
							callback();
						}.bind(this));
					}
					else{
						callback();
					}
				},

				createUserQueryObj:function(queries){
					if(!userQueriesObj){
						userQueriesObj = new queriesModel(queries);
					}
				},

				loadSearchView:function(callback){
					this.loadQueryDataForUser(callback);
				},

				renderSearchByTextView:function(){
					if(currentSearchtext){
						var query = userQueriesObj.handleTextQuery(ctrlModel.id,currentSearchtext,currentQueryObj);
						currentQueryId = query.id;
						this.renderSearchView();
					}
				},

				renderSearchView:function(){
					this.resetView();
					ctrlView = new searchMainView(ctrlModel,{
						'queries':userQueriesObj,
						'queryId':currentQueryId,
						'currDisplay':currentDisplay,
						'currQueryObj':currentQueryObj,
						'onSearch':this.searchQuery.bind(this),
						'handleTextQuery':this.handleTextQuery.bind(this),
						'onPinChart':this.onPinChart.bind(this),
						'handleOutlierQuery' : this.handleOutlierQuery.bind(this),
						'userModel':userModel
					});
					ctrlView.render();
				},

				onPinChart:function(panelModel){
					ctrlOptions.handlePinItem(panelModel);
				},

				handleTextQuery:function(dataSet,queryStr){
					var query = userQueriesObj.handleTextQuery(dataSet.id,queryStr);
					routie('app/search/'+ dataSet.id + '/' + query.id);
				},

				searchQuery:function(id,display){
					userQueriesObj.getQueryResults(id,privateFn.onQueryResponse.bind(this,id,display))
				},

				onQueryResponse:function(id,display,results){
					ctrlView.search(id,display,results);
				},

				resetView:function(){
					if(ctrlView){
						ctrlView.destroy();
						ctrlView = null;
					}
				},

				deleteQueriesByDataId:function(id){
					if(userQueriesObj){
						userQueriesObj.deleteQueriesByDataId(id);
					}
				},

				handleOutlierQuery : function(panelModel, widget){
					userQueriesObj.getQueryResults(panelModel.id, function(qModel) { 
						if(!qModel.outliers)
							qModel.outliers = {};
						
						if(!qModel.outliers[panelModel.display]){							
							serviceRouter.getOutliers(panelModel, panelModel.display, function(res){
								qModel.outliers[panelModel.display] = res;
								widget.renderOutliers(res); 		
							});
						}												
					});	
				}
			};
			
			this.initDrill = function(dataSetModel,qStr,qObj){
				var queryStr = atob(qStr);
				var queryObj = JSON.parse(atob(qObj));

				ctrlModel = dataSetModel;
				currentDisplay = null;
				currentSearchtext = queryStr;
				currentQueryObj = queryObj;

				privateFn.loadSearchView(privateFn.renderSearchByTextView.bind(privateFn));
			}

			this.init = function(dataSetModel,qId,display){
				ctrlModel = dataSetModel;
				currentQueryId = qId;
				currentDisplay = display;
				currentQueryObj = null;
				currentSearchtext = null;
				privateFn.loadSearchView(privateFn.renderSearchView.bind(privateFn));
			}

			this.destroyView = function(){
				privateFn.resetView();
			}

			this.handleQueriesOnDataSetDelete = function(id){
				privateFn.deleteQueriesByDataId(id);
			}
		}
		return ctrl;
	})();
	NS.searchCtrl = searchCtrl;
})(window,routie);