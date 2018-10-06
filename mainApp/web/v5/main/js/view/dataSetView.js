(function(NS,routie){
	var utils = NS.utils;

	var dataSetView = (function(){
		

		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var crudModelView = null;
			var container = $('.mainContainer');
			
			var privateFn = {
				renderView:function(){
					this.getTemplate();
				},
				getTemplate:function(){
					utils.getHBUITemplate('datasetTmpl.hbs',this.addTemplateToUI.bind(this))
				},

				addTemplateToUI:function(hbTemplate){
					var dataSetsJson = viewModel.getJson();
					container.html(hbTemplate({datasets:dataSetsJson}));
					this.bindUIEvents();
				},

				bindUIEvents:function(){
					$('.dummyAddDataSet').unbind('click').bind('click',this.handleDataSetAdd.bind(this));
					$('.dummyDataSetCont').unbind('click').bind('click',this.onDataSetClick.bind(this));
					$('.dummyRemoveDataSet').unbind('click').bind('click',this.handleDataSetDelete.bind(this));	
					$('.dummyDataSetEdit').unbind('click').bind('click',this.handleDataSetEdit.bind(this));
				},

				handleDataSetAdd:function(e){
					e.preventDefault();
					e.stopPropagation();
					viewOptions.add();
				},

				handleDataSetUpdate:function(data){
					viewOptions.update(data);
				},

				handleDataSetEdit:function(e){
					var target = e.currentTarget;
					e.preventDefault();
					e.stopPropagation();
					var dataSetId = $(target).attr('data-id');
					viewOptions.editHierarchy(dataSetId);
				},

				handleDataSetDelete:function(e){
					var target = e.currentTarget;
					e.preventDefault();
					e.stopPropagation();
					var dataSetId = $(target).attr('data-id');
					e.preventDefault();
					viewOptions.remove(dataSetId);
				},

				onDataSetClick:function(e){
					var target = e.currentTarget;
					var dataSetId = $(target).attr('data-id');
					e.preventDefault();
					e.stopPropagation();
					var dataSet = viewModel.getDataSetById(dataSetId);
					if(dataSet.state == dataSetState.SEARCH){
						routie('app/4/' + dataSetId);
					}else{
						this.createCrudView(dataSet);
					}
				},

				createCrudView:function(data){
					if(crudModelView){
						crudModelView.destroy();
						crudModelView = null;
					}
					crudModelView = new dataSetCrudView(data,{
						'onModeClose':this.onCrudViewClose.bind(this)
					});
					crudModelView.render();
				},

				onCrudViewClose:function(data){
					this.handleDataSetUpdate(data);
					if(crudModelView){
						crudModelView.destroy();
						crudModelView = null;
					}
				},

				update:function(){
					container.empty();
					this.renderView();
				}
			}

			this.render = function(){
				privateFn.renderView();
			};

			this.destroy = function(){
				viewModel = null;
				container.empty();
			};

			this.update = function(data){
				privateFn.update();
				
			};
		};
		return view;
	})();

	NS.dataSetView = dataSetView;
})(window,routie);