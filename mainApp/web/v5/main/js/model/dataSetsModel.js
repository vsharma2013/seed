(function(NS){
	var serviceRouter = NS.serviceRouter;
	var dataSetHierarchyModel = NS.dataSetHierarchyModel;

	var dataSetsModel = (function(){
		var model = function(data){
			var modelData = data;
			var hierarchyModelMap = {};
			if(!data){
				modelData = [];
			}
			sort();

			function sort(){
				modelData.sort(function(a,b){
					return new Date(a.createdDate) - new Date(b.createdDate);
				})
			}
			
			this.each = function(callback){
				for(var i=0;i<modelData.length;i++){
					callback(modelData[i]);
				}
			}

			this.getDataSetById = function(id){
				var dataSet = null;
				if(modelData && modelData.length > 0){
					for(var i=0;i<modelData.length;i++){
						if(modelData[i].id == id){
							dataSet = modelData[i];
						}
					}
				}
				return dataSet;
			};

			this.createNewDataSet = function(){
				var id = utils.getUUId();
				var name = 'Dataset_' + (modelData.length + 1);
				return {
					id:id,
					name:name,
					description:'',
					'fileName':'',
					'state':dataSetState.ADDED,
					'filePath':''
				}
			};

			this.saveDataSet = function(dataSetJSON,callback){
				serviceRouter.saveDataSet(dataSetJSON,callback);
			},

			this.editDataSet = function(dataSetJSON,callback){
				serviceRouter.updateDataSet(dataSetJSON,callback);
			},

			this.deleteDataSet = function(id,callback){
				var dataSet = this.getDataSetById(id);
				serviceRouter.deleteDataSet(id,function(){
					this.deleteDataSetById(id);
					callback(id,dataSet.name);
				}.bind(this));
			},

			this.addDataSet = function(dataSetJSON){
				modelData.push(dataSetJSON);
			}

			this.updateDataSet = function(dataSetJSON){
				var id = dataSetJSON.id;
				var existingData = this.getDataSetById(id);
				for(var prop in dataSetJSON){
					existingData[prop] = dataSetJSON[prop];
				}
			}

			this.checkIsFileProcessed = function(id,callback){
			 	serviceRouter.getDataSetState(id,function(state){
			 		if(state > dataSetState.PROCESSING){
			 			var dataSet = this.getDataSetById(id);
			 			dataSet.state = state;
			 			if(callback){
			 				callback(dataSet);
			 			}
			 		}
			 		else{
			 			setTimeout(function(){
			 				this.checkIsFileProcessed(id,callback);
			 			}.bind(this),500);
			 		}
			 	}.bind(this));
			}

			this.deleteDataSetById = function(id){
				if(modelData && modelData.length > 0){
					for(var i=0;i<modelData.length;i++){
						if(modelData[i].id == id){
							dataSets = modelData.splice(i,1);
							break;
						}
					}
				}
			};

			this.getHierarchyModel = function(id,callback){
				if(hierarchyModelMap[id]){
					callback(hierarchyModelMap[id]);
				}
				else{
					serviceRouter.getDataSetHierarchyData(id,function(data){
						hierarchyModelMap[id] = new dataSetHierarchyModel(data);
						callback(hierarchyModelMap[id]);
					})
				}
			}

			this.saveHierarchy = function(id,callback){
				var hierarchyModel = hierarchyModelMap[id];
				var data = {
					'fileId':id,
					'heararchy':hierarchyModel.getHierarchyJson()
				}
				serviceRouter.saveHierarchyData(id,data,callback);
			}

			this.getJson = function(){
				return modelData;
			};
		}
		return model;
	})();
	NS.dataSetsModel = dataSetsModel;
})(window);