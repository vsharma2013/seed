(function(NS){
	var utils = NS.utils;
	var dataSetHierarchyModel = (function(){
		var model = function(data){
			var modelData = {};

			function processData(data){
				modelData = {};
				data = JSON.parse(JSON.stringify(data));
				for(var header in data){
					var hierarchy = data[header];
					if(hierarchy.parents && hierarchy.parents.length == 0){
						createHierarchyDataFromRoot(hierarchy,header);
					}
				}
			}

			function createHierarchyDataFromRoot(hierarchy,header){
				modelData[header] = hierarchy;
				var childs = hierarchy.childs;
				for(var header in childs){
					var childHierarchy = childs[header];
					createHierarchyDataFromRoot(childHierarchy,header);
				}
			}
			processData(data);

			this.addChildNodeToParent = function(parent,child){
				var hierarchy = modelData[parent];
				var childHierarchy = modelData[child];
				if(!hierarchy || !childHierarchy){
					return;
				}
				var childs = hierarchy.childs;
				if(!childs){
					hierarchy.childs = {};
					childs = hierarchy.childs;
				}
				if(childs[child]){
					return;
				}

				if(childHierarchy.parents.indexOf(parent) == -1){
					childHierarchy.parents.push(parent)
					childs[child] = childHierarchy;
					//this.updateChildForAllParents(child);
				}
			}

			this.cutNodeFromParent = function(child,parent){
				var hierarchy = modelData[parent];
				var childHierarchy = modelData[child];
				if(!hierarchy || !childHierarchy){
					return false;
				}

				var childs = hierarchy.childs;
				if(childs && childs[child]){
					delete childs[child]
				}

				var childParents = childHierarchy.parents;
				if(childParents && childParents.length > 0){
					childParents.splice(childParents.indexOf(parent),1);
					//this.updateChildForAllParents(child);
				}

				return true; 
			}

			this.pasteNodeOnParent = function(parent,cutCopyObj){
				var copyData = JSON.parse(JSON.stringify(modelData));

				var cutCopyNode = cutCopyObj.data.text;
				var cutCopyParentNode = cutCopyObj.parentData.text;
				var flgCopy = cutCopyObj.isCopy;

				var cutCopyHiearchy = modelData[cutCopyNode];
				if(!cutCopyHiearchy){
					return;
				}

				if(!flgCopy){
					this.cutNodeFromParent(cutCopyNode,cutCopyParentNode);
				}

				if(this.validatePaste(parent,cutCopyNode)){
					this.addChildNodeToParent(parent,cutCopyNode);
					return true;
				}
				else{
					processData(copyData);
					return false;
				}
			}

			this.deleteNode = function(parent,child){
				var hierarchy = modelData[parent];
				var childHierarchy = modelData[child];
				if(!hierarchy || !childHierarchy){
					return;
				}
				this.cutNodeFromParent(child,parent);
			}

			this.validatePaste = function(parent,child,flgMessage){
				var parentHierarchy = modelData[parent];
				if(!parentHierarchy){
					var childHierarchy = modelData[child];
					if(childHierarchy && childHierarchy.parents.length == 0){
						return true;
					}
					return false;
				}

				if(parent == child){
					if(flgMessage){
						utils.showMessage('PARENT_SAME_AS_CHILD');
					}
					return false;
				}

				var childs = parentHierarchy.childs;
				if(childs && childs[child]){
					if(flgMessage){
						utils.showMessage('CHILD_ALREADY_EXIT');
					}
					return false;
				}

				var allParents = this.getAllParentsForHeader(parent);
				if(allParents.indexOf(child) != -1){
					if(flgMessage){
						utils.showMessage('CHILD_ALREADY_PARENT');
					}
					return false;
				}
				return true;
			}

			this.checkParent = function(node){
				var hierarchy = modelData[node];
				if(hierarchy){
					if(hierarchy.parents && hierarchy.parents.length > 0){
						return true;
					}
				}
				return false;
			}

			this.isCutEnabled = function(node){
				var hierarchy = modelData[node];
				if(hierarchy){
					return true;
				}
				return false;
			}

			this.isCopyEnabled = function(node){
				var hierarchy = modelData[node];

				if(hierarchy && hierarchy.parents.length > 0){
					return true;
				}
				console.log(false);
				return false;
			}

			this.isPasteEnabled = function(selectedNode,pastedNode){
				return this.validatePaste(selectedNode,pastedNode);
			}

			this.isDeleteEnabled = function(node){
				var hierarchy = modelData[node];
				if(hierarchy){
					return true;
				}
				return false; 
			}

			this.updateChildForAllParents = function(child){
				var childHierarchy = modelData[child];
				if(!childHierarchy){
					return;
				}
				var childParents = childHierarchy.parents;
				childParents.forEach(function(pt){
					var hc = modelData[pt];
					hc.childs[child] = childHierarchy;
				});
			}

			this.getHierarchyJson = function(){
				return modelData;
			}

			this.getChildsForHeader = function(header){
				var hierarchy = modelData[header];
				if(hierarchy){

				}
			}

			this.createRootNode = function(){
				var rootNodes = {};
				if(modelData){
					for(var header in modelData){
						var parent = modelData[header].parents;
						if(!parent || parent.length == 0){
							rootNodes[header] = modelData[header];
						}
					}
				}
				return {
					parents:[],
					childs:rootNodes
				}
			}

			this.getAllParentsForHeader = function(header){
				var hierarchy = modelData[header];
				var allParents = [];
				if(hierarchy){
					var parents = hierarchy.parents;
					if(parents && parents.length > 0){
						parents.forEach(function(parent){
							allParents.push(parent);
							allParents = allParents.concat(this.getAllParentsForHeader(parent));
						}.bind(this));
					}
				}
				return allParents;
			}

			this.possibleAddableHeaders = function(header){
				var alreadyAddHeader = this.getAllHeadersAlreadyAdded(header);
				var canAddHeaders = [];
				for(var key in modelData){
					if(alreadyAddHeader.indexOf(key) == -1){
						canAddHeaders.push(key);
					}
				}
				return canAddHeaders;
			}

			this.getAllHeadersAlreadyAdded = function(header){
				var hierarchy = modelData[header];
				var headers = [];
				if(hierarchy){
					var childs = hierarchy.childs;
					if(childs && childs.length >0){
						headers = Object.keys(childs);
					}

					var allParents = this.getAllParentsForHeader(header);
					headers = headers.concat(allParents);
				}
				return headers;
			}
		}
		return model;
	})();
	NS.dataSetHierarchyModel = dataSetHierarchyModel;
})(window);