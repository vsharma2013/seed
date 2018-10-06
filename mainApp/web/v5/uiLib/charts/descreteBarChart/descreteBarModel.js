(function(NS){
	var utils = NS.utils;
	var descreteBarModel = (function(){

		var model = function(options){
			var modelData = options.data;
			var isCompare = options.isCompare;

			var getDataForCompareChart = function(){
				var data = null;
				var keys = Object.keys(modelData);

				if(keys && keys.length > 0){
					var key = keys[0];
					data = [];
					var frame = modelData[key];
					var sectors = frame.sectors;
					for(var sector in sectors){
						var t = sectors[sector];
						data.push({
							label : t.label,
							value : t.count
						});
					}
				}
				if(!data || data.length == 0){
                    return null;
                }

				var retData = [{
					key:"Cumulative Return",
					values:data
				}];
				return retData;
			}

			var getDataForChart = function(){
				var data = null;
				var colors = utils.getDefaultColors();
				
				if(modelData && modelData.length > 0){
					var frame = modelData[0];
					var container = frame.container;
					data = [];
					container.sectors.top.forEach(function(t){
						data.push({
							label : t.key,
							value : t.count,
							color : colors.pop()
						});
					});
					if(container.sectors.othersCount > 0){
						var otherVals = [];
						container.sectors.others.forEach((function(o){
							data.push({
								label : o.key,
								value : o.count,
								color : colors.pop()
							});
						}).bind(this));
					}
				}
				if(!data || data.length == 0){
                    return null;
                }
				var retData = [{
					key:"Cumulative Return",
					values:data
				}];
				return retData;
			};

			this.getData = function(){
				var chartData = null;
				if(isCompare){
					chartData = getDataForCompareChart();
				}
				else{
					chartData = getDataForChart();
				}
				return chartData;
			}
		}
		return model;
	})();

	NS.descreteBarModel = descreteBarModel;
})(window);