(function(NS){
	var utils = NS.utils;
	var serviceRouter = NS.serviceRouter;
	var dataSetsModel = NS.dataSetsModel;
	var dashboardsModel = NS.dashboardsModel;

	var appModel = (function(){
		var model = function(data){
			var modelData = data;
			var dataSetsModelObj = null;
			var dashboardsModelObj = null;
			var sharedDashboardsModelObj = null;

			var init = function(){
				dataSetsModelObj = new dataSetsModel(modelData.dataSets);
				dashboardsModelObj = new dashboardsModel(modelData.dashboards,modelData.sharedDashboards);
			}

			this.getDataSets = function(){
				return dataSetsModelObj;
			}

			this.getDashboards = function(){
				return dashboardsModelObj;
			}

			this.getSharedDashboards = function(){
				return sharedDashboardsModelObj;
			}
			init();
		}

		return model;
	})();



	NS.appModel = appModel;
})(window);