(function(NS,routie){
	var utils = NS.utils;
	var serviceRouter = NS.serviceRouter;
	var hierarchyPreview = NS.hierarchyPreview;
	var dataSetHierarchyEditor = NS.dataSetHierarchyEditor;
	var dataSetHierarchyModel = NS.dataSetHierarchyModel;

	var dataSetHierarchyView = (function(){
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var hierarchyTreeView = null;
			var privateFn = {
				renderView:function(){
					this.getTemplate();
				},
				getTemplate:function(){
					utils.getHBUITemplate('dataSetHierarchyCrudTempl.hbs',this.addTemplateToUI.bind(this))
				},

				addTemplateToUI:function(hbTemplate){
					var dataSetHeaders = options.dataSetObj.headers;
					$(document.body).append(hbTemplate({headers:dataSetHeaders}));
					this.bindModelEvents();
					this.showModel();
				},

				showModel:function(){
					container.modal('show');
				},

				bindModelEvents:function(){
					container = $('#hierarchyEditModel');
					container.off('show.bs.modal').on('show.bs.modal',this.onModelShow.bind(this));
					container.off('hide.bs.modal').on('hide.bs.modal',this.onModelHide.bind(this));
				},

				bindUIEvents:function(){
					$('.dummyHierarchyChangesSave').unbind('click').bind('click',this.handleSaveHierarchyChanges.bind(this));
					//$('.dummyPreviewHierarchyBtn').unbind('click').bind('click',this.renderHierarchyPreview.bind(this));
					//$('.dummyEditHierarchyBtn').unbind('click').bind('click',this.renderHierarchyEditView.bind(this));
				},

				handleSaveHierarchyChanges:function(){
					viewOptions.onHierarchySave(options.dataSetObj.id);
				},

				resetToPreview:function(){
					$('.dummyEditCtrl').hide();
					$('.dummyPreviewCtrl').show();
				},

				resetToEdit:function(){
					$('.dummyEditCtrl').show();
					$('.dummyPreviewCtrl').hide();
				},

				onModelShow:function(){
					this.bindUIEvents();
					this.resetToPreview();
					setTimeout(function(){
						//this.renderHierarchyPreview();
						this.renderHierarchyEditView();
					}.bind(this),500);
					
				},

				renderHierarchyPreview:function(){
					this.resetToPreview();
					this.resetHierarchyView();
					hierarchyTreeView = new hierarchyPreview(viewModel.getHierarchyJson());
					hierarchyTreeView.render();
				},

				renderHierarchyEditView:function(){
					this.resetToEdit();
					this.resetHierarchyView();
					hierarchyTreeView = new dataSetHierarchyEditor(viewModel);
					hierarchyTreeView.render();
				},

				resetHierarchyView:function(){
					if(hierarchyTreeView){
						hierarchyTreeView.destroy();
						hierarchyTreeView = null;
					}
				},

				onModelHide:function(){
					//viewOptions.onModeClose(viewModel);
				},

				destroy:function(){
					viewModel = null;
					this.resetHierarchyView();
					container.remove();
				}
			}
			this.render = function(){
				privateFn.renderView();
			}

			this.destroy = function(){
				privateFn.destroy();
			}
		};
		return view;
	})();

	NS.dataSetHierarchyView = dataSetHierarchyView;
})(window,routie);