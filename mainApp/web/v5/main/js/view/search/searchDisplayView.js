(function(NS,routie){
	var utils = NS.utils;
	var searchDisplayView = (function(){
		
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var container = $('.'+viewOptions.contClass);
			
			var privateFn = {
				renderView:function(){
					this.getTemplate();
				},
				getTemplate:function(){
					utils.getHBUITemplate('searchDisplayTmpl.hbs',this.addTemplateToUI.bind(this))
				},

				addTemplateToUI:function(hbTemplate){
					var uiData = this.getUIData();
					container.html(hbTemplate({displays:uiData}));
					this.bindUIEvents();
				},

				getUIData:function(){
					var displayData = [];
					if(viewModel && viewModel.length >0){
						for(var i=0;i<viewModel.length;i++){
							var display = viewModel[i];
							var isSelected = (display == viewOptions.display)?1:0;
							displayData.push({
									display:display,
									isSelected:isSelected,
									dataId:viewOptions.dataId,
									qId:viewOptions.qId
							});
						}
					}
					return displayData;
				},

				bindUIEvents:function(){
				}
			}

			this.render = function(){
				privateFn.renderView();
			};

			this.destroy = function(){
				viewModel = null;
				container.empty();
			};
		};
		return view;
	})();

	NS.searchDisplayView = searchDisplayView;
})(window,routie);