var probalisticModel = require('./problisticModel');
var esQueryHelper = require('./esQueryHelper');

var hierarchyExtractor = function(options){
	this.hierarchy = {};
	this.esQueryHelper = new esQueryHelper();
	this.options = options
	options.esQueryHelper = this.esQueryHelper;
	this.pm = new probalisticModel(options);
}

hierarchyExtractor.prototype = {
	dispose:function(){
		this.pm.dispose();
		this.hierarchy = {};
		this.esQueryHelper.dispose();
		this.esQueryHelper = null;
	},

	getHierarchy:function(){
		return this.pm.createProbalisticModel()
				.then(function(model){
					return this.runHierExtractorOnProblisticModel(model);
				}.bind(this));
	},

	runHierExtractorOnProblisticModel:function(model,callback){
		for(var childContext in model){
			var parentContextMap = model[childContext];
			if(!this.hierarchy[childContext]){
				this.hierarchy[childContext] = {p1Parents:{},p2Parents:{}};
			}
			this.getHierarchyFromProbMap(childContext,parentContextMap);
		}
		this.getPercForMultipleParentCase(model);
		this.removingNoiseFromHierarchy();
		//console.log(JSON.stringify(this.hierarchy));

		return this.tryCreatingHierarchy();
	},

	getHierarchyFromProbMap:function(childContext,parentContextMap){
		var uniqueProbMap = parentContextMap.uniqueProbMap;
		var termProbMap = parentContextMap.termProbMap;
		var p1Parents = this.hierarchy[childContext].p1Parents;
		var p2Parents = this.hierarchy[childContext].p2Parents;
		for(var parContext in uniqueProbMap){
			if(uniqueProbMap[parContext] && termProbMap[parContext]){
				var pUniq = uniqueProbMap[parContext].prob * 100;
				var pTerm = termProbMap[parContext].prob * 100;
				if(pUniq > 95 && pTerm > 95){
					p1Parents[parContext] = {'pUniq':pUniq,'pTerm':pTerm};
				}else if(pUniq > 70 && pTerm > 70){
					p2Parents[parContext] = {'pUniq':pUniq,'pTerm':pTerm};
				}
			}
		}
	},

	getPercForMultipleParentCase:function(model){
		for(var childContext in this.hierarchy){
			var p1Parents = this.hierarchy[childContext].p1Parents;
			var p1ParentsKeys = Object.keys(p1Parents);
			if(p1ParentsKeys.length > 1){
				this.calcPercForMutipleParentCase(p1Parents,model,childContext);
			}

			var p2Parents = this.hierarchy[childContext].p2Parents;
			var p2ParentsKeys = Object.keys(p2Parents);
			if(p2ParentsKeys.length > 1){
				this.calcPercForMutipleParentCase(p2Parents,model,childContext);
			}
		}
	},

	calcPercForMutipleParentCase:function(parents,model,childContext){
		for(var parentContext in parents){
			var uniquePercMap = model[childContext].uniqueProbMap;
			var termPercMap = model[childContext].termProbMap;
			if(uniquePercMap[parentContext] && termPercMap[parentContext]){

				var probUniq = uniquePercMap[parentContext].prob;
				var probTerm = termPercMap[parentContext].prob;
				var uniqueChildCount = model[childContext].uniqueCount;
				var uniqueParentCount = model[parentContext].uniqueCount;
				parents[parentContext]['percUniq'] = probUniq * (uniqueParentCount/uniqueChildCount);
				parents[parentContext]['percTerm'] = probTerm * (uniqueParentCount/uniqueChildCount);
			}
		}
	},

	tryCreatingHierarchy:function(callback){
		var headerData = this.options.headerData;
		var headerJsonMap = {};
		headerData.forEach(function(headerJson){
			headerJsonMap[headerJson.header] = headerJson;
		});
		console.log('hierarchy generated');
		//console.log(JSON.stringify(this.hierarchy));
		//console.log(JSON.stringify(this.hierarchy));
		var hierarchyChildParentMap = {};
		for(var context in this.hierarchy){
			if(!hierarchyChildParentMap[context]){
				var childHeaderJson = headerJsonMap[context];
				hierarchyChildParentMap[context] = {'headerId':childHeaderJson.id,'type':childHeaderJson.type,'parents': [],'childs':{}};
			}
			var p1Parents = this.hierarchy[context].p1Parents;
			var p1ParentsKeys = Object.keys(p1Parents);
			for(var parent in p1Parents){
				if(hierarchyChildParentMap[context]){
					if(hierarchyChildParentMap[context].childs[parent]){
						continue;
					}
				}
				hierarchyChildParentMap[context].parents.push(parent);
				if(!hierarchyChildParentMap[parent]){
					var parentHeaderJson = headerJsonMap[parent];
					hierarchyChildParentMap[parent] = {'headerId':parentHeaderJson.id,'type':parentHeaderJson.type,'parents': [],'childs':{}};
				}
				hierarchyChildParentMap[parent].childs[context] = hierarchyChildParentMap[context];
			}
		};

		var hierarchy = {
			'fileId':this.options.fileId,
			'heararchy':hierarchyChildParentMap
		};
		return hierarchy;
	},

	removingNoiseFromHierarchy:function(){
		this.handleSiblingCases();
		this.handleMutipleParentCase();
	},

	handleMutipleParentCase:function(){
		for(var childContext in this.hierarchy){
			var p1Parents = this.hierarchy[childContext].p1Parents;
			var p1ParentsKeys = Object.keys(p1Parents);
			if(p1ParentsKeys.length > 1){
				var finParents = this.getFinParentForMultipleParentCase(p1Parents);
				p1Parents = JSON.parse(JSON.stringify(p1Parents)); 
				this.hierarchy[childContext].p1Parents = {};
				finParents.forEach(function(parent){
					var parentObj = p1Parents[parent];
					if(parentObj){
						this.hierarchy[childContext].p1Parents[parent] = parentObj;
					}
				}.bind(this));
			}

			var p2Parents = this.hierarchy[childContext].p2Parents;
			var p2ParentsKeys = Object.keys(p2Parents);
			if(p2ParentsKeys.length > 1){
				var finParents =  this.getFinParentForMultipleParentCase(p2Parents);
				p2Parents = JSON.parse(JSON.stringify(p2Parents));
				this.hierarchy[childContext].p2Parents = {};
				finParents.forEach(function(parent){
					var parentObj = p2Parents[parent];
					if(parentObj){
						this.hierarchy[childContext].p2Parents[parent] = parentObj;
					}
				}.bind(this));
			}
		}
	},

	getParentsBelongToSameHierarchy:function(parents){
		var parentGroups = [];
		var keys = Object.keys(parents);
		keys.forEach(function(pChild){
			var group = {};
			group[pChild] = 1;
			
			var p1Parents = this.hierarchy[pChild].p1Parents;
			for(var parent in p1Parents){
				if(parents[parent]){
					group[parent] = 1;
				}
			}
			parentGroups.push(group);
		}.bind(this));
		
		return this.checkGroupMerge(parentGroups);
	},

	checkGroupMerge:function(groups){
		var finGroups = [];
		for(var i=0;i<groups.length;i++){
			var grp1 = groups[i];
			var flgMerged = false;
			for(var j=0;j<finGroups.length;j++){
				var grp2 = finGroups[j];
				var flgCanMerge = false;
				for(var key in grp1){
					if(grp2[key]){
						flgCanMerge = true;
						break;
					}
				}
				if(flgCanMerge){
					for(var key in grp1){
						grp2[key] = 1;
					}
					flgMerged = true;
					break;
				}
			}

			if(!flgMerged){
				finGroups.push(grp1);
			}
		}
		return finGroups;
	},

	getFinParentForMultipleParentCase:function(parents){
		var parentGroups = this.getParentsBelongToSameHierarchy(parents);
		var finParents = {};
		parentGroups.forEach(function(grp){
			var tempParent = null;
			for(var parentContext in grp){
				if(!tempParent){
					tempParent = parentContext;
				}else{
					if(parents[parentContext].percUniq/parents[tempParent].percUniq > 1.5){
						tempParent = parentContext;
					}
				}
			}
			finParents[tempParent] = 1;
		});
		
		var allParents = Object.keys(finParents);
		for(var tempParent in finParents){
			var tempParentObj = this.hierarchy[tempParent];
			if(tempParentObj && tempParentObj.siblings){
				var siblings = tempParentObj.siblings;
				for(var sib in siblings){
					allParents.push(sib);
				}
			}
		};
		//var finParent = parents[tempParent];
		return allParents;
	},

	handleSiblingCases:function(){
		for(var childContext in this.hierarchy){
			var parents = this.hierarchy[childContext].p1Parents;
			for(var parentContext in parents){
				var parentObj = parents[parentContext];
				//console.log('first',parentObj);
				
				var reverseChildObj = this.hierarchy[parentContext].p1Parents[childContext];
				reverseChildObj = (!reverseChildObj?(this.hierarchy[parentContext].siblings?this.hierarchy[parentContext].siblings[childContext]:null):reverseChildObj);
				//console.log('second',reverseChildObj);
				if(reverseChildObj){
					 if(!this.hierarchy[childContext]["siblings"]){
					 	this.hierarchy[childContext]["siblings"] = {};
					 }
					 this.hierarchy[childContext].siblings[parentContext] = parentObj;
					 delete parents[parentContext];
				}
			}
		}
	}
}

module.exports = hierarchyExtractor;