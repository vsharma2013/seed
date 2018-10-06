(function(NS){
	var serviceRouter = NS.serviceRouter;
	var utils = NS.utils;
	var sharedDashboardsModel = (function(){
		var model = function(data){
			var modelData = data;
			if(!data){
				modelData = {};
			}

			sort();

			function sort(){
				modelData.sort(function(a,b){
					return new Date(a.createdDate) - new Date(b.createdDate);
				})
			}

			this.getDashboardById = function(id){
				if(modelData && modelData.length > 0){
					for(var i=0;i<modelData.length;i++){
						var dashboard = modelData[i].dashboard;
						if(dashboard.id === id){
							return dashboard;
						}
					}
				}
				return null;
			};

			this.getJson = function(){
				return modelData;
			}
			
		}
		return model;
	})();

	NS.sharedDashboardsModel = sharedDashboardsModel;
})(window);