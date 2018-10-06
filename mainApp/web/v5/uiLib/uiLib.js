(function(NS){
	var uiLib = function(){
		this.uiFactory = new NS.uiFactory();
	};

	uiLib.prototype.renderComponent = function(chart){
		var component = this.uiFactory.getInstance(chart.id,chart.settings,chart);
		component.init();
		return component;
	};

	NS.uiLib = uiLib;
})(window);