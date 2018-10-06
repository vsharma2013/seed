(function(NS){
	var utils = NS.utils;
	var cummLineChartModel = (function(){

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

				if(data && data.length > 0){
					var groups = {};
					data.forEach(function(d){
						var timeLine = d.timeline;
						var label = d.label;
						if(!groups[label]){
							groups[label] = [];
						}
						if(timeLine && timeLine.timeGroups && timeLine.timeGroups.length > 0){
							var timeGroup = timeLine.timeGroups[0];
							for(var key in timeGroup){
								var tg = timeGroup[key];
								groups[label].push([tg.tKey,tg.count]);
							};
						}
					});

					var retData = [];
					for(var key in groups){
						retData.push({
							'key':key,
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
				
				if(timeGroups && timeGroups.length > 0){
					var timeGroup = timeGroups[0];
					var groups = {};
					for(var key in timeGroup){
						var keyMaps = timeGroup[key];
						if(keyMaps && keyMaps.length > 0){
							keyMaps.forEach(function(map){
								var label = map.label;
								if(!groups[label]){
									groups[label] = [];
								}
								groups[label].push([map.tKey,map.count]);
							});
						}
					}

					var retData = [];
					for(var key in groups){
						retData.push({
							'key':key,
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

	NS.cummLineChartModel = cummLineChartModel;
})(window);