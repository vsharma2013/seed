(function(NS){
	var hierarchyPreview = (function(){
		var view = function(model){
			var viewModel = model;
			var cont = $('.dummyHierarchyPreviewTreeCont');
			

			function createDataForTree(data){
				var treeJson = {
					'dumId':'dummy',
					"name":'root',
					"children":[]
				};
				for(var key in data){
					var item = data[key];
					if(item.parents.length == 0){
						treeJson.children.push(createTreeJsonFromRoot(key,item));
					}
				}
				return treeJson;
			}

			function createTreeJsonFromRoot(key,item){
				var root = {
					'name':key,
					'children':[]
				}
				if(item.childs){
					for(var child in item.childs){
						var obj = item.childs[child];
						root.children.push(createTreeJsonFromRoot(child,obj));
					}
				}
				return root;
			}

			this.render = function(){
				cont.css("height",$('.dummyLeftContainer').height() + 'px');

				var treeJson  = createDataForTree(viewModel);
				 cont.find('.tree-container').empty();
		         new treeEditorHor({
		            treeContainer:cont,
		            treeId:"tree-container",
		            data:treeJson
		         });
			}

			this.destroy = function(){
				cont.find('.tree-container').empty();
			}
		}
		return view;
	})();

	NS.hierarchyPreview = hierarchyPreview;
})(window)