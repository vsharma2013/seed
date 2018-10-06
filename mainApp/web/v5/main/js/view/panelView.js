(function(NS){
	var utils = NS.utils;
	var widget = NS.widget;

	var panelView = (function(){
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var panelView = null;
			var container = null;

			var privateFn = {
				renderView:function(contClass){
					var height = 300;
					var chartSettings = viewModel.chartSettings;
					chartSettings['h'] = height;
					chartSettings['w']=$('.'+contClass).width();
					
					viewModel.chartSettings = chartSettings;

					var widgetOptions = {};
					widgetOptions['contClass'] = contClass;
					widgetOptions['height'] = height;
					widgetOptions['panel'] = viewModel;
					widgetOptions['title'] = viewModel.title;
					widgetOptions['description'] = viewModel.description;
					if(!viewOptions.isSharedDashboard){
						widgetOptions.onUnPinClick = this.onUnPinPanel.bind(this,viewModel.id);
					}

					if(viewOptions.isSharedDashboard){
						widgetOptions.disableDrillDown = true;
					}

					panelView = new widget(widgetOptions);
					panelView.render();
				},

				onUnPinPanel:function(id){
					viewOptions.onRemovePanel(id);
				}
			};
			
			this.render = function(contClass){
				container = $('.' + contClass);
				privateFn.renderView(contClass);
			};

			this.destroy = function(){
				panelView.destroy();
				viewModel = null;
				container.empty();
			};
		};
		return view;
	})();

	NS.panelView = panelView;
})(window);