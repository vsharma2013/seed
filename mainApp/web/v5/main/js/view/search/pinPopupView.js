(function(NS){
	var utils = NS.utils;

	var pinPopUpView = (function(){
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var container = null;

			var privateFn = {
				renderView:function(){
					this.getTemplate();
				},
				getTemplate:function(){
					utils.getHBUITemplate('pinPopupTmpl.hbs',this.addTemplateToUI.bind(this))
				},

				addTemplateToUI:function(hbTemplate){
					var dashboardModel = viewOptions.dashboards;
					var dashboardJson = dashboardModel.getJson();
					$(document.body).append(hbTemplate({panel:viewModel,'dashboards':dashboardJson}));
					$('.dummyPinnedDashboardDrpDwn').selectpicker();
					this.bindModelEvents();
					this.showModel();
				},

				showModel:function(){
					container.modal('show');
				},

				bindModelEvents:function(){
					container = $('#pinPopupModel');
					container.off('show.bs.modal').on('show.bs.modal',this.onModelShow.bind(this));
					container.off('hide.bs.modal').on('hide.bs.modal',this.onModelHide.bind(this));
				},

				bindUIEvents:function(){
					$('.dummyPinToDashboard').unbind('click').bind('click',this.onModelSave.bind(this));
				},

				onModelSave:function(){
					var title = $('.dummyPinPanelTitle').val();
					var description = $('.dummyPinPanelDescription').val();
					var dashboardId = $('.dummyPinnedDashboardDrpDwn').selectpicker('val');
					if(title && dashboardId){
						viewModel.title = title;
						viewModel.description = description;

						viewOptions.onSave(viewModel,dashboardId);
						container.modal('hide');
					}
					else{
						utils.showMessage("PANEL_VALIDATION");
					}
				},

				onModelShow:function(){
					this.bindUIEvents();
				},

				onModelHide:function(){
					this.destroy();
				},

				destroy:function(){
					viewModel = null;
					container.remove();
				}
			};
			
			this.render = function(contClass){
				container = $('.' + contClass);
				privateFn.renderView(contClass);
			};

			this.destroy = function(){
				viewModel = null;
				container.empty();
			};
		};
		return view;
	})();

	NS.pinPopUpView = pinPopUpView;
})(window);