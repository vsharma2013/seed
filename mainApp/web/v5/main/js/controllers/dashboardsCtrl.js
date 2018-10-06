(function(NS){
	var dashboardsView = NS.dashboardsView;
	var dashboardPanelView = NS.dashboardPanelView;
	var pinPopUpView = NS.pinPopUpView;
	var utils = NS.utils;
	var dashboardsCtrl = (function(){
		var controller = function(options){
			var ctrlModel = null;
			var ctrlView = null;
			var ctrlOptions = options;
			var pinModelView = null;
			var dahsboardViews = null;

			var privateFn = {
				renderView:function(){
					this.resetView();
					ctrlView = new dashboardsView(ctrlModel,{
						'add':this.addDashboard.bind(this),
						'update':this.updateDashboard.bind(this),
						'remove':this.deleteDashboard.bind(this)
					});
					ctrlView.render();
				},

				renderDashboardPanelView:function(id){
					this.resetDashboardPanelView(id);
					var model = ctrlModel.getDashboardById(id);
					var dashboardPanelViewObj = new dashboardPanelView(model,{
						removePanel:this.onPanelRemove.bind(this),
						isSharedDashboard:ctrlModel.isSharedDashboard(id)
					});
					dashboardPanelViewObj.render();
					dahsboardViews = dashboardPanelViewObj;
				},

				resetDashboardPanelView:function(){
					if(dahsboardViews){
						dahsboardViews.destroy();
						dahsboardViews = null;
					}
				},

				renderPinModelView:function(pinModel){
					this.resetPinModelView();
					var dashboardCnt = ctrlModel.getDashboardCount();
					if(dashboardCnt > 0){
						pinModelView = new pinPopUpView(pinModel,{
							'dashboards':ctrlModel,
							'onSave':this.savePanelToDashboard.bind(this)
						});
						pinModelView.render();
					}
					else{
						utils.showMessage('NO_DASHBOARDS');	
					}
				},

				savePanelToDashboard:function(panel,dashboardId){
					ctrlModel.addPanelToDashboard(panel,dashboardId);
				},

				resetPinModelView:function(){
					if(pinModelView){
						pinModelView.destroy();
						pinModelView = null;
					}
				},

				resetView:function(){
					if(ctrlView){
						ctrlView.destroy();
						ctrlView = null;
					}
				},

				onPanelRemove:function(panelId,dashboard){
					ctrlModel.removePanel(panelId,dashboard,function(){
						utils.showMessage('PANEL_UNPIN_SUCCESS');
					});
				},

				addDashboard:function(data){
					var defJson = ctrlModel.createNewDashboard();
					for(var prop in data){
						defJson[prop] = data[prop];
					}
					ctrlModel.saveDashboard(defJson,this.onAddDashboard.bind(this));
				},

				onAddDashboard:function(dashboardJson){
					ctrlModel.addDashboard(dashboardJson);
					ctrlView.update();
				},

				updateDashboard:function(dataSetJson){
					ctrlModel.editDashboard(dataSetJson,this.onUpdateDashboard.bind(this,dataSetJson));
				},

				onUpdateDashboard:function(dataSetJson){
					ctrlModel.updateDashboard(dataSetJson);
					ctrlView.update();
				},

				deleteDashboard:function(id){
					ctrlModel.deleteDashboard(id,this.onDeleteDashboard.bind(this));
				},

				onDeleteDashboard:function(id){
					ctrlOptions.deleteTab(id);
					ctrlView.update();
				},
				deletePanelsByDataId:function(dataId){
					if(ctrlModel){
						ctrlModel.deletePanelsByDataId(dataId);
					}
				}
			};

			this.render = function(dashboardsModel){
				ctrlModel = dashboardsModel;
				privateFn.renderView();
			};

			this.renderPinModel = function(dashboardsModel,pinModel){
				ctrlModel = dashboardsModel;
				privateFn.renderPinModelView(pinModel);
			};

			this.renderDashboardPanelView = function(dashboardsModel,id){
				ctrlModel = dashboardsModel;
				privateFn.renderDashboardPanelView(id);
			};

			this.destroyView = function(){
				privateFn.resetView();
				privateFn.resetDashboardPanelView();
			}

			this.handleDataSetDelete =function(dataId){
				privateFn.deletePanelsByDataId(dataId)
			}
		}
		return controller;
	})();
	NS.dashboardsCtrl = dashboardsCtrl;
})(window);