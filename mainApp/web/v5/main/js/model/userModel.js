(function(NS){
	var usermodel = (function(){
		var defaultChartType = {
			'CONTAINER':5,
			'TIMELINE':9,
			'COMPARETIMELINE':11
		};

		var model = {
			getContainerChartType : function(){
				return defaultChartType.CONTAINER;
			},

			getTimelineChartType:function(){
				return defaultChartType.TIMELINE;
			},

			getCompareTimelineChartType :function(){
				return defaultChartType.COMPARETIMELINE;
			},

			setContainerChartType :function(chartType){
				defaultChartType.CONTAINER = chartType;
			},

			setTimelineChartType:function(chartType){
				defaultChartType.TIMELINE = chartType;
			},

			setCompareTimelineChartType:function(chartType){
				defaultChartType.COMPARETIMELINE = chartType;
			}
		}
		return model;
	})();

	NS.userModel = usermodel;
})(window);