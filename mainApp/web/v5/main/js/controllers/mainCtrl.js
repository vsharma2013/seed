(function(NS){
	var serviceRouter = NS.serviceRouter;
	var appModel = NS.appModel;
	var appView = NS.appView;
	var appRouter = NS.appRouter;
	var searchCtrl = NS.searchCtrl;
 	var dataSetsCtrl = NS.dataSetsCtrl;
 	var dashboardsCtrl = NS.dashboardsCtrl;

	var mainCtrl = (function(){
		var controller = function(){
			var ctrlModel = null;
			var ctrlView = null;
			var currTabIndex = tabTypes.DATASETS;
			var searchCtrlObj = new searchCtrl({
											'handlePinItem':function(pinModel){
												pFn.loadPinModelView(pinModel);
											}
										});
			var dataSetsCtrlObj = new dataSetsCtrl({
				'onDataSetDelete':function(id){
					pFn.onDataSetDelete(id);
				}
			});
			var dashboardCtrlObj = new dashboardsCtrl({
				'deleteTab':function(id){
					pFn.deleteDashboardPaneTab(id);
				}
			});

			var pFn = {
				loadViewForTab:function(params){
					var tabIndex = params[0];
					params.splice(0,1);
					if(!tabIndex){
						tabIndex = tabTypes.DATASETS;
					}
					currTabIndex = parseInt(tabIndex);
					var loadViewCallback = null;
					switch(currTabIndex){
						case tabTypes.DATASETS:
							loadViewCallback = this.loadDataSetsView.bind(this);
							break;
						case tabTypes.DASHBAORDS:
							loadViewCallback = this.loadDashboardsView.bind(this);
							break;
						case tabTypes.DASHBOARDPANEL:
							loadViewCallback = this.loadDashboardPanelView.bind(this,params);
							break;
						case tabTypes.SEARCH:
							loadViewCallback = this.loadSearchView.bind(this,params);
							break;
						case tabTypes.DRILL:
							loadViewCallback = this.loadDrillView.bind(this,params);
							break;
					}
					this.loadAllDataByUser(loadViewCallback);
				},
				loadAllDataByUser:function(callback){
					if(!ctrlModel){
						serviceRouter.getAllData(function(allData){
							this.createAppModelAndView(allData);
							callback();
						}.bind(this));
					}
					else{
						callback();
					}
				},
				createAppModelAndView:function(allData){
					if(!ctrlModel){
						ctrlModel = new appModel(allData);
					}
					if(!ctrlView){
						ctrlView = new appView(ctrlModel);
					}
				},

				handleViewChange:function(){
					dataSetsCtrlObj.destroyView();
					dashboardCtrlObj.destroyView();
					searchCtrlObj.destroyView();
				},

				loadDataSetsView:function(){
					ctrlView.renderDataSetTab();
					this.handleViewChange();
					var dataSetsModel = ctrlModel.getDataSets();
					dataSetsCtrlObj.render(dataSetsModel);
				},

				loadDashboardsView:function(){
					ctrlView.renderDashboardsTab();
					this.handleViewChange();
					var dashboardsModel = ctrlModel.getDashboards();
					dashboardCtrlObj.render(dashboardsModel);
				},

				loadPinModelView:function(pinModel){
					var dashboardsModel = ctrlModel.getDashboards();
					dashboardCtrlObj.renderPinModel(dashboardsModel,pinModel);
				},

				loadDashboardPanelView:function(params){
					ctrlView.renderDashboardPanelTab.apply(ctrlView,params);
					var dashboardsModel = ctrlModel.getDashboards();
					var params1 = [dashboardsModel].concat(params);
					this.handleViewChange();
					
					dashboardCtrlObj.renderDashboardPanelView.apply(dashboardCtrlObj,params1);
				},

				loadSearchView:function(params){
					ctrlView.renderSearchPanelTab.apply(ctrlView,params);
					var dataSetsModel = ctrlModel.getDataSets();
					var dataSet = dataSetsModel.getDataSetById.apply(ctrlModel,params);
					params[0] = dataSet;
					this.handleViewChange();
					searchCtrlObj.init.apply(searchCtrlObj,params);
				},

				loadDrillView:function(params){
					ctrlView.renderSearchDrillPanelTab.apply(ctrlView,params);
					var dataSetsModel = ctrlModel.getDataSets();
					var dataSet = dataSetsModel.getDataSetById.apply(ctrlModel,params);
					params[0] = dataSet;
					this.handleViewChange();
					searchCtrlObj.initDrill.apply(searchCtrlObj,params);
				},

				onDataSetDelete:function(id){
					searchCtrlObj.handleQueriesOnDataSetDelete(id);
					dashboardCtrlObj.handleDataSetDelete(id);
				},

				convertArgumentsToArr:function(args){
					var params = [];
					for(var i=0;i<args.length;i++){
						params.push(args[i]);
					}
					return params;
				},

				deleteDashboardPaneTab:function(id){
					ctrlView.deleteDashboardPanelTab(id);
				}
			};

			this.loadApp = function(){
				var args = pFn.convertArgumentsToArr(arguments);
				pFn.loadViewForTab(args);
			};

			this.loadSearch = function(){
				var args = [tabTypes.SEARCH];
				args = args.concat(pFn.convertArgumentsToArr(arguments));
				pFn.loadViewForTab(args);	
			};

			this.loadDrillView = function(){
				var args = [tabTypes.DRILL];
				args = args.concat(pFn.convertArgumentsToArr(arguments));
				pFn.loadViewForTab(args);	
			};
		};

		return controller;
	})();

	NS.mainCtrl = mainCtrl;
})(window);