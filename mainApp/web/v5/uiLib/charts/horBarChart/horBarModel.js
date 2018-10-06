(function(NS){
	var utils = NS.utils;
	var horBarModel = (function(){

		var model = function(options){
			var modelData = options.data;
			var isCompare = options.isCompare;

			var getDataForCompareChart = function(){
				var data = null;
				var keys = Object.keys(modelData);
				var colors = utils.getDefaultColors();
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
				var retData = [{
					key:"Cumulative Return",
					values:data,
					color:colors.pop()
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
				var retData = [{
					key:"",
					values:data,
					color:colors.pop()
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

	NS.horBarModel = horBarModel;
})(window);