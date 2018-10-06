(function(NS){
	var uiFactory = function(){

	};

	uiFactory.prototype.getInstance = function(uiCompId,userSettings,userOptions){
		var instance = null;
		var compDict = NS.uiComponentDictionary;
		var chartId = parseInt(uiCompId);
		switch(chartId){
			case compDict.PIE3D:
				instance = new NS.chart3dPie(userSettings,userOptions);
				break;
			case compDict.BAR:
				instance = new NS.barChart(userSettings,userOptions);
				break;
			case compDict.LINE:
				instance = new NS.lineChart(userSettings,userOptions);
				break;
			case compDict.DESCRETEBAR:
				var dataModel = new NS.descreteBarModel(userOptions);
				instance = new NS.descreteBarChart(dataModel,userSettings,userOptions);
				break;
			case compDict.PIE:
				var dataModel = new NS.PieChartModel(userOptions);
				instance = new NS.pieChart(dataModel,userSettings,userOptions);
				break;
			case compDict.DONUT:
				var dataModel = new NS.donutModel(userOptions);
				instance = new NS.donutChart(dataModel,userSettings,userOptions);
				break;
			case compDict.HBAR:
				var dataModel = new NS.horBarModel(userOptions);
				instance = new NS.horBarChart(dataModel,userSettings,userOptions);
				break;
			case compDict.AREA:
				var dataModel = new NS.areaChartModel(userOptions);
				instance = new NS.areaChart(dataModel,userSettings,userOptions);
				break;
			case compDict.MULTIBAR:
				var dataModel = new NS.barChartNewModel(userOptions);
				instance = new NS.barChartNew(dataModel,userSettings,userOptions);
				break;
			case compDict.CUMMLINE:
				var dataModel = new NS.cummLineChartModel(userOptions);
				instance = new NS.cummLineChart(dataModel,userSettings,userOptions);
				break;
			case compDict.SIMPLELINE:
				var dataModel = new NS.simpleLineModel(userOptions);
				instance = new NS.simpleLineChart(dataModel,userSettings,userOptions);
				break;
			default:
				break;
		}
		return instance;
	};

	NS.uiFactory = uiFactory;
})(window);