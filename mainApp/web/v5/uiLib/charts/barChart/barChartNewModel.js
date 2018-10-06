(function(NS){
	var utils = NS.utils;
	var barChartNewModel = (function(){

		var model = function(options){
			var modelData = options.data;
			var isCompare = options.isCompare;

			var getDataForCompareChart = function(){
				var data = null;
				var keys = Object.keys(modelData);
				if(keys && keys.length > 0){
					var key = keys[0];
					data = modelData[key].timelines;
				}
				var colors = utils.getDefaultColors();
				if(data && data.length > 0){
					var groups = {};
					data.forEach(function(d){
						var timeLine = d.timeline;
						var label = d.label;
						if(!groups[label]){
							groups[label] = [];
						}
						if(timeLine && timeLine.timeGroups && timeLine.timeGroups.length > 0){
							timeLine.timeGroups.forEach(function(timeGroup){
								for(var key in timeGroup){
									var tg = timeGroup[key];
									groups[label].push({
										x : tg.tKey,
										y : tg.count
									});
								};
							});
						}
					});

					var retData = [];
					for(var key in groups){
						retData.push({
							'key':key,
							'color':colors.pop(),
							'values':groups[key]
						})
					}
					return retData;
				}
				
				return null;
			}

			var getDataForChart = function(){
				var data = modelData[0]?modelData[0].timeline:null;
				if(!data){
					return;
				}
				var timeGroups = data.timeGroups;
				var colors = utils.getDefaultColors();
				if(timeGroups && timeGroups.length > 0){
					var groups = {};
					timeGroups.forEach(function(timeGroup){
						for(var key in timeGroup){
							var keyMaps = timeGroup[key];
							if(keyMaps && keyMaps.length > 0){
								keyMaps.forEach(function(map){
									var label = map.label;
									if(!groups[label]){
										groups[label] = [];
									}
									groups[label].push({
										x : map.tKey,
										y : map.count
									});
								});
							}
						}
					});

					var retData = [];
					for(var key in groups){
						retData.push({
							'key':key,
							'color':colors.pop(),
							'values':groups[key]
						})
					}
					return retData;
				}
				
				return null;
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

	NS.barChartNewModel = barChartNewModel;
})(window);