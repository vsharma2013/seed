(function(NS,routie){
	var utils = NS.utils;
	var dashboardCrudView = NS.dashboardCrudView;

	var dashboardsView = (function(){
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var container =  $('.mainContainer');
			var crudView = null;

			var privateFn = {
				renderView:function(){
					this.getTemplate();
				},
				getTemplate:function(){
					utils.getHBUITemplate('dashboardTmpl.hbs',this.addTemplateToUI.bind(this))
				},

				addTemplateToUI:function(hbTemplate){
					var dashboardsJson = viewModel.getJson();
					var sharedDashboards = viewModel.getSharedDashboards();
					var isSharedDashboard = sharedDashboards && sharedDashboards.length > 0?1:0;
					container.html(hbTemplate({dashboards:dashboardsJson,sharedDashboards:sharedDashboards,isSharedDashboard:isSharedDashboard}));
					this.bindClickEvent();
				},

				onDashboardClick:function(e){
					var target = e.currentTarget;
					e.preventDefault();
					e.stopPropagation();
					var id = $(target).attr('data-id');
					routie('app/3/' + id);
				},

				onDashboardAdd:function(){
					var data = {};
					this.openDashboardCrudView({},true);
				},

				onDashBoardEdit:function(e){
					var target = e.currentTarget;
					e.preventDefault();
					e.stopPropagation();
					var id = $(target).attr('data-id');
					var model = viewModel.getDashboardById(id);
					this.openDashboardCrudView(model);
				},

				onDashBoardRemove:function(e){
					var target = e.currentTarget;
					e.preventDefault();
					e.stopPropagation();
					var id = $(target).attr('data-id');
					this.onDataDelete(id);
				},

				bindClickEvent:function(){
					$('.dummyDashboardCont').unbind('click').bind('click',this.onDashboardClick.bind(this));
					$('.dummyDashboardAdd').unbind('click').bind('click',this.onDashboardAdd.bind(this));
					$('.dummyDashboardEdit').unbind('click').bind('click',this.onDashBoardEdit.bind(this));
					$('.dummyDashboardRemove').unbind('click').bind('click',this.onDashBoardRemove.bind(this));
				},

				unbindClickEvent:function(){
					$('.dummyDashboardCont').unbind('click');
					$('.dummyDashboardAdd').unbind('click');
					$('.dummyDashboardEdit').unbind('click');
				},

				openDashboardCrudView:function(data,isAdded){
					if(crudView){
						crudView.destroy();
						crudView = null;
					}

					crudView = new dashboardCrudView(data,{
						'onModeClose':this.onCrudViewClose.bind(this),
						'onDataSave':this.onDataSave.bind(this),
						'onDataAdd':this.onDataAdd.bind(this),
						'isAdded':isAdded
					});
					crudView.render();
				},

				onCrudViewClose:function(){

				},

				onDataAdd:function(data){
					viewOptions.add(data);
				},

				onDataSave:function(data){
					viewOptions.update(data);
				},

				onDataDelete:function(id){
					viewOptions.remove(id);
				},

				update:function(){
					container.empty();
					this.renderView();
				}
			};

			this.render = function(){
				privateFn.renderView();
			};

			this.destroy = function(){
				privateFn.unbindClickEvent();
				viewModel = null;
				container.empty();
			};

			this.update = function(){
				privateFn.update();
			};
		};
		return view;
	})();

	NS.dashboardsView = dashboardsView;
})(window,routie);