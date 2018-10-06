(function(NS){
	var utils = NS.utils;

	var dataSetHierarchyEditor = (function(){
		var view = function(model){
			var viewModel  = model;
			var cont = $('.dummyHierarchyEditcontainer');
			var cutCopyNode = {};
			var moveNodes = {};

			function addNodeToTextInCompleteUI(childNode,parentNode){
				var parentText = parentNode.text;
				var allIds = getAllIdsFromTreeByTest(parentText);
				if(allIds && allIds.length > 0){
					allIds.splice(allIds.indexOf(parentNode.id),1);
					allIds.forEach(function(parentId){
						//var parentNode = getNodeById(parentId);
						cont.jstree("copy_node",childNode,parentId);
					});
				}
			}

			function removeNodeToTextInCompleteUI(childNode,parentNode){
				var parentText = parentNode.text;
				var allIds = getAllIdsFromTreeByTest(parentText);
				if(allIds && allIds.length > 0){
					allIds.splice(allIds.indexOf(parentNode.id),1);
					allIds.forEach(function(parentId){
						var parentNode = getNodeById(parentId);
						if(parentNode.children && parentNode.children.length > 0){
							parentNode.children.forEach(function(parentChildId){
								var parentChild = getNodeById(parentChildId);
								if(parentChild.text == childNode.text){
									cont.jstree("delete_node",parentChild);
								}
							})
						}
					});
				}
			}

			function addNodeToRootInCaseNoParent(node){
				if(!viewModel.checkParent(node)){
					cont.jstree("copy_node",node,'#','last');
				}
			}

			function getAllIdsFromTreeByTest(text){
				var treeObj = cont.jstree("get_json");
				return getIdsForNodeByText(treeObj,text);
			}

			function getIdsForNodeByText(treeObj,text){
				var ids = [];
				if(treeObj && treeObj.length > 0){
					treeObj.forEach(function(node){
						if(node.text == text){
							ids.push(node.id);
						}
						if(node.children && node.children.length > 0){
							ids = ids.concat(getIdsForNodeByText(node.children,text));
						}
					})
				}
				return ids;
			}

			function storeCutCopyObj(isCopy){
				var selectedNode = getSelectedNode();
				var parent = selectedNode.parent;

				cutCopyNode = {
					'data':selectedNode,
					'isCopy':isCopy,
					'parentData':getNodeById(parent)
				}
			}

			function getNodeById(id){
				var node = cont.jstree("get_node",id);
				return node;
			}

			function getSelectedNode(){
				var node = cont.jstree("get_selected",true);
				if(node && node.length > 0){
					return node[0];
				}
				return null;
			}

			function handleDragCopyNode(node){
				var inst = $.jstree.reference(node);
				inst.copy(node);
			}

			function handleDragCutNode(node){
				var inst = $.jstree.reference(node);
				inst.cut(node);
			}

			function handleDragPasteNode(node,draggedNode,isCopy){
				var draggedNode = {
					'data':draggedNode,
					'isCopy':isCopy,
					'parentData':getNodeById(draggedNode.parent)
				}
				if(viewModel.pasteNodeOnParent(node.text,draggedNode)){
					var inst = $.jstree.reference(node);
					inst.paste(draggedNode);
				}
			}

			function handleDropConfirmation(draggedNode,droppedNode,onConfirmCallback){
				var selector = document.getElementById(droppedNode.id + '_anchor');//cont.jstree("get_node",droppedNode.id,true);
				if(selector){
					var elem = selector;
					$(elem).attr("data-toggle","confirmation");
					$(elem).confirmation({
						'title':draggedNode.text + ' node is copied.You want to move it?',
						'btnOkLabel':"Move It",
						"btnOkIcon":"",
						"btnCancelIcon":"",
						'btnCancelLabel':"Copy it",
						'singleton':true,
						'popout':true,
						'onConfirm':function(){
							onConfirmCallback();
							$(elem).confirmation('destroy');
						},
						'onCancel':function(){
							$(elem).confirmation('destroy');
						}
					});
					//$(elem).confirmation();
					$(elem).confirmation('show');
				}
			}

			function Start(data){
				var roots = [];
				for(var key in data){
					var item = data[key];
					if(item.parents && item.parents.length == 0){
						roots.push(createTreeJsonFromRoot(key,item));
					}
				}

				var treeJson = {
					"check_callback" : function (op, node, par, pos, more) {
					    if ((op === "move_node" || op === "copy_node") && node.type && node.type == "root") {
					        return false;
					    }

					    if((op === "move_node" || op === "copy_node")){
					    	moveNodes = {draggedNode:node,droppedNode:par};
					    	if(node && par){
						    	if(!viewModel.validatePaste(par.text,node.text)){
						    		console.log('Invalid Paste');
						    		return false;
						    	}
						    }
					    }
					    return true;
					},
		    		"themes" : { "stripes" : true },
		    		'multiple': false,
					"data":roots
				};

				
				return treeJson;
			}

			function createTreeJsonFromRoot(key,item){
				var root = {
					'text':key,
					 'state' : {
			           'opened' : true
			         },
					'children':[]
				}
				if(item.childs){
					for(var child in item.childs){
						var obj = item.childs[child];
						root.children.push(createTreeJsonFromRoot(child,obj));
					}
				}
				return root;
			};

			function customMenu(node) {
		        //var keys = Object.keys(hierarchyjson);
		        // The default set of all items
		        var items = {
		            cutNodeItem: { // The "rename" menu item
		                label: "Cut",
		                separator_after:true,
		                icon:'fa fa-cut',
		                action: function(){
		                	handleCutNode();
		                }
		            },
		            copyNodeItem:{
		            	label: "Copy",
		            	icon:'fa fa-copy',
		                separator_after:true,
		                action: function(){
		                	handleCopyNode();
		                }
		            },
		            pasteNodeItem:{
		            	label: "Paste",
		            	icon:'fa fa-paste',
		                separator_after:true,
		                action: function(){
		                	handlePasteEvent();
		                }
		            },
		            deleteItem: { // The "delete" menu item
		                label: "Delete",
		                icon:'fa fa-eraser',
		                separator_after:true,
		                action: function () {
		                	handleDeleteNode();
		                }
		            }
		        };

		        if(!isCutEnabled(node.text)){
		        	delete items.cutNodeItem;
		        }

		        if(!isCopyEnabled(node.text)){
		        	delete items.copyNodeItem;
		        }

		        if(!isPasteEnabled(node.text)){
		        	delete items.pasteNodeItem;
		        }

		        if(!isDeleteEnabled(node.text)){
		        	delete items.deleteItem;
		        }

		        /*var data = viewModel.getHierarchyJson();
		        for(var key in data){
		            items.AddNodeItem.submenu[key] = {
		                  "label":key,
		                  "action": function (data) {
		                      console.log(data);
		                      var inst = $.jstree.reference(data.reference),
		                      obj = inst.get_node(data.reference);
		                      console.log(inst,obj);
		                  }
		            }
		        }*/
		        //console.log(items);
		        return items;
		    }

		    function bindEditEvents(){
		    	$('.dummyHierarchyTreeCut').unbind('click').bind('click',handleCutNode);
		    	$('.dummyHierarchyTreeCopy').unbind('click').bind('click',handleCopyNode);
		    	$('.dummyHierarchyTreePaste').unbind('click').bind('click',handlePasteEvent);
		    	$('.dummyHierarchyTreeDelete').unbind('click').bind('click',handleDeleteNode);
		    }

		    function handleCutNode(){
		    	storeCutCopyObj();
		    	var selectedNode = getSelectedNode();
		    	var inst = $.jstree.reference(selectedNode);

				if(inst.is_selected(selectedNode)) {
					inst.cut(inst.get_top_selected());
				}
				else {
					inst.cut(selectedNode);
				}
				enableDisableButton(true,'dummyHierarchyTreePaste');
				utils.showMessage("HIERARCHY_LINE_CUT",selectedNode.text);
		    }

		    function handleCopyNode(){
		    	storeCutCopyObj(true);
		    	var selectedNode = getSelectedNode();
		    	var inst = $.jstree.reference(selectedNode);

				if(inst.is_selected(selectedNode)) {
					inst.copy(inst.get_top_selected());
				}
				else {
					inst.copy(selectedNode);
				}
				enableDisableButton(true,'dummyHierarchyTreePaste');
				utils.showMessage("HIERARCHY_LINE_COPY",selectedNode.text);
		    }

		    function handlePasteEvent(){
		    	if(!cutCopyNode || !cutCopyNode.data){
		    		return;
		    	}
		    	var selectedNode = getSelectedNode();

		    	if(viewModel.validatePaste(selectedNode.text,cutCopyNode.data.text,true)){
		    		var inst = $.jstree.reference(selectedNode);
					inst.paste(selectedNode);
					addNodeToTextInCompleteUI(cutCopyNode.data,selectedNode);

					if(!cutCopyNode.isCopy){
						removeNodeToTextInCompleteUI(cutCopyNode.data,cutCopyNode.parentData);
		    		}
		    		viewModel.pasteNodeOnParent(selectedNode.text,cutCopyNode);
		    		utils.showMessage("HIERARCHY_LINE_PASTE",cutCopyNode.data.text);
		    		cutCopyNode = {};
				}
		    }

		    function handleDeleteNode(){
		    	cutCopyNode = {};
		    	var selectedNode = getSelectedNode();
		    	var parentNode = getNodeById(selectedNode.parent);
		    	commonDelete(selectedNode,parentNode);
		    }

		    function commonDelete(selectedNode,parentNode){
	    		viewModel.deleteNode(parentNode.text,selectedNode.text);

		    	var inst = $.jstree.reference(selectedNode);
				inst.delete_node(selectedNode);
				removeNodeToTextInCompleteUI(selectedNode,parentNode);
				addNodeToRootInCaseNoParent(selectedNode);
		    }

		    function handleButtonOnSelection(headerName){
		    	createAddMenu(headerName);

		    }

		    function isCutEnabled(text){
		    	return viewModel.isCutEnabled(text);
		    }

		    function isCopyEnabled(text){
		    	return viewModel.isCopyEnabled(text);
		    }

		    function isPasteEnabled(text){
		    	if(!cutCopyNode || !cutCopyNode.data){
		    		return false;
		    	}
		    	return viewModel.isPasteEnabled(text,cutCopyNode.data.text);
		    }

		    function isDeleteEnabled(text){
		    	return viewModel.isDeleteEnabled(text);
		    }


		    function bindNodeSelectionEvent(){
		    	cont.on("select_node.jstree",
				     function(evt, data){
				     	var text = data.node.text;
				     	handleSelection(text);
				     });

		    	$(document).on("dnd_stop.vakata.jstree",function(){
		    		if(moveNodes && moveNodes.draggedNode && moveNodes.droppedNode){
		    			var draggedNode = moveNodes.draggedNode;
		    			var node = moveNodes.droppedNode;

		    			var draggedNodeObj = {
							'data':draggedNode,
							'isCopy':true,
							'parentData':getNodeById(draggedNode.parent)
						};
						var directCut = false;

						if(!viewModel.checkParent(draggedNode.text)){
							directCut = true;
						}
						addNodeToTextInCompleteUI(draggedNode,node);
						if(viewModel.pasteNodeOnParent(node.text,draggedNodeObj)){
							if(directCut){
								commonDelete(draggedNodeObj.data,draggedNodeObj.parentData);
							}
							else{
								handleDropConfirmation(moveNodes.draggedNode,moveNodes.droppedNode,function(){
			    					commonDelete(draggedNodeObj.data,draggedNodeObj.parentData);
			    				});
							}
						}
		    		}
		    		else{
		    			throw "Some problem in drag and drop";
		    		}
		    		return true;
		    	});
		    }

		    function handleSelection(text){
		    	var enabledObj = {
		     		cutEnable:isCutEnabled(text),
		     		copyEnable:isCopyEnabled(text),
		     		pasteEnable:isPasteEnabled(text),
		     		deleteEnable:isDeleteEnabled(text)
		     	};
		        enableDisableButtons(enabledObj);
		    }

		    function enableDisableButtons(enableObj){
		    	if(enableObj.cutEnable){
		    		enableDisableButton(true,'dummyHierarchyTreeCut');
		    	}
		    	else{
		    		enableDisableButton(false,'dummyHierarchyTreeCut');
		    	}
		    	if(enableObj.copyEnable){
		    		enableDisableButton(true,'dummyHierarchyTreeCopy')
		    	}
		    	else{
		    		enableDisableButton(false,'dummyHierarchyTreeCopy');
		    	}
		    	if(enableObj.pasteEnable){
		    		enableDisableButton(true,'dummyHierarchyTreePaste');
		    	}
		    	else{
		    		enableDisableButton(false,'dummyHierarchyTreePaste');
		    	}

		    	if(enableObj.deleteEnable){
		    		enableDisableButton(true,'dummyHierarchyTreeDelete')
		    	}
		    	else{
		    		enableDisableButton(false,'dummyHierarchyTreeDelete');
		    	}
		    }

		    function enableDisableButton(flgEnable,className){
		    	var ele = $('.'+ className);
		    	if(flgEnable){
		    		ele.removeClass('disabled');
		    	}
		    	else{
		    		ele.addClass('disabled');
		    	}
		    }


		    this.render = function(){
		    	$(".dummyHierarchyEditTreeCont").css("height",$('.dummyLeftContainer').height() + 'px');
		    	var treeJson = Start(viewModel.getHierarchyJson());
		    	cont.empty();
	         	cont.jstree({
		          	'core':treeJson,
		          	'types':{
			            "default" : {
			              "icon" : "fa fa-folder-open-o"
			            }
		          	},
		          	'dnd':{
		          		'always_copy':true
		          	},
		          	'contextmenu':{
		             	"items":customMenu
		          	},
		         	"plugins" : ["themes","types","contextmenu","dnd"]
		        });
		        bindNodeSelectionEvent();
		        handleSelection('root');
		        bindEditEvents();
		    }

		    this.destroy = function(){
		    	$.jstree.destroy();
		    	cont.empty();
		    }
		}
		return view;
	})();
	NS.dataSetHierarchyEditor = dataSetHierarchyEditor;
})(window);