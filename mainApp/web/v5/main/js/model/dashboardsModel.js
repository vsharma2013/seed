(function(NS){
	var serviceRouter = NS.serviceRouter;
	var sharedDashboardsModel =NS.sharedDashboardsModel;
	var utils = NS.utils;
	var dashboardsModel = (function(){
		var model = function(data,sharedDashboardData){
			var modelData = data;
			var sharedDashboardModelObj = new sharedDashboardsModel(sharedDashboardData);
			if(!data){
				modelData = [];
			}

			sort();

			function sort(){
				modelData.sort(function(a,b){
					return new Date(a.createdDate) - new Date(b.createdDate);
				})
			}

			this.getSharedDashboardModel = function(){
				return sharedDashboardModelObj;
			}

			this.getSharedDashboards = function(){
				return sharedDashboardModelObj.getJson();
			}

			this.getSharedDashboardById = function(id){
				return this.getSharedDashboardModel().getDashboardById(id);
			}

			this.isSharedDashboard = function(id){
				var sharedDashboard = this.getSharedDashboardById(id);
				return sharedDashboard?true:false;
			}

			this.getDashboardCount =function(){
				return modelData.length;
			}

			this.getDashboardById = function(id){
				if(modelData && modelData.length > 0){
					for(var i=0;i<modelData.length;i++){
						if(modelData[i].id === id){
							return modelData[i];
						}
					}
				}

				var sharedDashboard = this.getSharedDashboardById(id);
				if(sharedDashboard){
					return sharedDashboard;
				}

				return null;
			};

			this.createNewDashboard = function(){
				var id = utils.getUUId();
				var name = 'Dashboard_' + (modelData.length + 1);
				return {
					id:id,
					name:name,
					description:'',
					panels:[]
				}
			};

			this.addPanelToDashboard = function(panel,dashId){
				var dashboard = this.getDashboardById(dashId);
				if(!dashboard.panels){
					dashboard.panels = [];
				}
				panel.id = utils.getUUId();
				delete panel._id;
				dashboard.panels.push(panel);
				this.editDashboard(dashboard,function(){

				});
			}

			this.removePanel = function(panelId,dashboard,callback){
				var panels = dashboard.panels;
				if(panels && panels.length >0){
					for(var i=0;i<panels.length;i++){
						if(panels[i].id == panelId){
							panels.splice(i,1);
							this.editDashboard(dashboard,callback);
							break;
						}
					}
				}
			}

			this.saveDashboard = function(dashboardJSON,callback){
				serviceRouter.saveDashboard(dashboardJSON,callback);
			};

			this.editDashboard = function(dashboardJSON,callback){
				serviceRouter.updateDashboard(dashboardJSON,callback);
			};

			this.deleteDashboard = function(id,callback){
				serviceRouter.deleteDashboard(id,function(){
					this.deleteDataDashboard(id);
					callback(id);
				}.bind(this));
			};

			this.addDashboard = function(dashboardJSON){
				modelData.push(dashboardJSON);
			}

			this.updateDashboard = function(dashboardJSON){
				var id = dashboardJSON.id;
				var existingData = this.getDashboardById(id);
				for(var prop in dashboardJSON){
					existingData[prop] = dashboardJSON[prop];
				}
			};

			this.deleteDataDashboard = function(id){
				var dashboards = modelData;
				if(dashboards && dashboards.length > 0){
					for(var i=0;i<dashboards.length;i++){
						if(dashboards[i].id == id){
							dashboards = dashboards.splice(i,1);
							break;
						}
					}
				}
			};

			this.deletePanelsByDataId = function(dataId){
				var dashboards = modelData;
				if(dashboards && dashboards.length > 0){
					for(var i=0;i<dashboards.length;i++){
						var panels = dashboards[i].panels;
						if(panels && panels.length > 0){
							for(var j=0;j<panels.length;j++){
								if(panels[j].dataId == dataId){
									panels.splice(j,1);
									j--;
								}
							}
						}
					}
				}
			};

			this.getJson = function(){
				return modelData;
			}

		}
		return model;
	})();

	NS.dashboardsModel = dashboardsModel;
})(window);