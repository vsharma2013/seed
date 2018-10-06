(function(NS){
	var utils = NS.utils;
	var panelView = NS.panelView;
	var dashboardPanelView = (function(){
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var container = $('.mainContainer');
			var panelViews = {};
			var privateFn = {
				renderView:function(){
					this.getTemplate();
				},
				getTemplate:function(){
					utils.getHBUITemplate('dashboardPanelTmpl.hbs',this.addTemplateToUI.bind(this))
				},

				addTemplateToUI:function(hbTemplate){
					container.html(hbTemplate(viewModel));
					this.renderPanels();
				},

				renderPanels:function(){
					var panels = viewModel.panels;
					if(panels && panels.length > 0){
						for(var i=0;i<panels.length;i++){
							var panelId = panels[i].id;
							panelViews[panelId] = new panelView(panels[i],{
								'onRemovePanel':this.onRemovePanel.bind(this),
								'isSharedDashboard':viewOptions.isSharedDashboard
							});
							panelViews[panelId].render(this.getPanelContainerClass(panelId));
						}
					}
					else{
						utils.showMessage('NO_PANEL_DASHBOARD');
					}
				},

				getPanelContainerClass:function(panelId){
					return 'class_'+ panelId;
				},

				onRemovePanel:function(panelId){
					if(panelViews[panelId]){
						panelViews[panelId].destroy();
						delete panelViews[panelId];
					}
					viewOptions.removePanel(panelId,viewModel);
				},

				destroy:function(){
					if(panelViews){
						for(var panelId in panelViews){
							panelViews[panelId].destroy();
							panelViews[panelId] = null;
						}
					}
					panelViews = null;
				}
			};

			this.render = function(){
				privateFn.renderView();
			}

			this.destroy = function(){
				privateFn.destroy();
				viewModel = null;
				container.empty();
			}
		};
		return view;
	})();

	NS.dashboardPanelView = dashboardPanelView;
})(window);