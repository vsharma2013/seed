(function(NS){
	var dataSetView = NS.dataSetView;
	var utils = NS.utils;
	var dataSetHierarchyView = NS.dataSetHierarchyView;
	var dataSetsCtrl = (function(){
		var controller = function(options){
			var ctrlModel = null;
			var ctrlView = null;
			var hierarchyView = null;

			var privateFn = {
				renderView:function(){
					this.resetView();
					ctrlView = new dataSetView(ctrlModel,{
						'add':this.addDataSet.bind(this),
						'update':this.updateDateSet.bind(this),
						'remove':this.deleteDataSet.bind(this),
						'editHierarchy':this.editHierarchy.bind(this)
					});
					ctrlView.render();
				},

				resetView:function(){
					if(ctrlView){
						ctrlView.destroy();
						ctrlView = null;
					}
				},

				editHierarchy:function(dataSetId){
					ctrlModel.getHierarchyModel(dataSetId,function(hierarchyModel){
						if(hierarchyView){
							hierarchyView.destroy();
							hierarchyView = null;
						}
						hierarchyView = new dataSetHierarchyView(hierarchyModel,{
							'onHierarchySave':this.onHierarchySave.bind(this),
							'dataSetObj':ctrlModel.getDataSetById(dataSetId)
						});
						hierarchyView.render();
					}.bind(this));
				},

				onHierarchySave:function(dataSetId){
					ctrlModel.saveHierarchy(dataSetId,function(){
						utils.showMessage('DATASET_HIERARCHY_SAVED');
					})
				},

				addDataSet:function(){
					var defJson = ctrlModel.createNewDataSet();
					ctrlModel.saveDataSet(defJson,this.onAddDataSet.bind(this));
				},

				onAddDataSet:function(dataSetJson){
					ctrlModel.addDataSet(dataSetJson);
					ctrlView.update();
					utils.showMessage('DATASET_ADDED',dataSetJson.name);
				},

				updateDateSet:function(dataSetJson){
					ctrlModel.editDataSet(dataSetJson,this.onUpdateDataSet.bind(this,dataSetJson));
				},

				onUpdateDataSet:function(dataSetJson){
					ctrlModel.updateDataSet(dataSetJson);
					ctrlView.update();
					this.isDataSetProcessed(dataSetJson);
				},

				deleteDataSet:function(id){
					ctrlModel.deleteDataSet(id,this.onDeleteDataSet.bind(this));
				},

				onDeleteDataSet:function(id,dataSetName){
					ctrlView.update();
					options.onDataSetDelete(id);
					utils.showMessage('DATASET_REMOVED',dataSetName);
				},

				handleDataSetStateOnLoad:function(){
					ctrlModel.each(function(dataSetJson){
						this.isDataSetProcessed(dataSetJson);
					}.bind(this));
				},

				isDataSetProcessed:function(dataSetJson){
					if(dataSetJson.state == dataSetState.PROCESSING){
						ctrlModel.checkIsFileProcessed(dataSetJson.id,function(state){
								if(ctrlView){
									ctrlView.update();
								}
								console.log('test done');
								utils.showMessage('DATASET_PROCESSING_COMPLETE',dataSetJson.name);
						}.bind(this))
					}
				},

				handlePinItem:function(panelModel){
					options.handlePinItem(panelModel);
				}
			};

			this.render = function(dataSetsModel){
				ctrlModel = dataSetsModel;
				privateFn.handleDataSetStateOnLoad();
				privateFn.renderView();

			};

			this.destroyView = function(){
				privateFn.resetView();
			}
		}
		return controller;
	})();
	NS.dataSetsCtrl = dataSetsCtrl;
})(window);