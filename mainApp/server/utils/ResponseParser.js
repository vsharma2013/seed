function ResponseParser (){

}
/*
ResponseParser.prototype.parse = function(apiRes){
	var uiObjects = [];
	apiRes.results.forEach((function(result){
		if(result.aggregations){
			var uiObject = this.getUIObjectForAggregation(result.aggregations);
			uiObject.queryDetails = { qSource : result.qSource, qTarget : result.qTarget};
			uiObjects.push(uiObject);
		}
	}).bind(this));
	return uiObjects;
}

ResponseParser.prototype.getUIObjectForAggregation = function(agg){
	var uiObject = {};
	var i = 1;
	Object.keys(agg).forEach((function(a){
		var k = 'key' + i;
		uiObject[k] = {};
		this.addNodesRecurssive(uiObject[k], agg[a], a);
		i++;
	}).bind(this));
	return uiObject;	
}

ResponseParser.prototype.addNodesRecurssive = function(obj, apiObj, strRootKey){
	var self = this;
	obj.key = strRootKey;
	obj.items = [];
	if(apiObj.buckets){
		apiObj.buckets.forEach(function(bucket){
			var bKeys = Object.keys(bucket);
			var item = { key : '', items : [] };	
			bKeys.forEach(function(bKey){													
				if(typeof(bucket[bKey]) === 'object'){
					var t = {key : ''};
					item.items.push(t);
					self.addNodesRecurssive(t, bucket[bKey], bKey);
				}
				else
					item[bKey] = bucket[bKey];				
			});	
			obj.items.push(item);			
		});
	}
}
*/

ResponseParser.prototype.parse = function(apiRes){
		var uiObjects = [];
		apiRes.results.forEach((function(result){
			if(result.aggregations){
				var uiObject = this.getUIObjectForAggregation(result.aggregations);
				uiObject.queryDetails = { qSource : result.qSource};
				uiObjects.push(uiObject);
			}
		}).bind(this));
		return uiObjects;
	}

ResponseParser.prototype.isCompareResponse = function(apiRes){
	if(apiRes.results && apiRes.results.length > 1){
		return true;
	}
	return false;
}

ResponseParser.prototype.getAllDisplayTypes = function(apiRes){
	var displays = [];
	apiRes.results.forEach(function(result){
		if(result.aggregations){
			var aggs = result.aggregations;
			displays = displays.concat(Object.keys(aggs));
		}
	});
	var finDisplay = {};
	if(displays && displays.length >0){
		for(var i=0;i<displays.length;i++){
			if(displays[i] != 'domain'){
				finDisplay[displays[i]] = 1;
			}
		}
	}
	return Object.keys(finDisplay);
}

ResponseParser.prototype.getTimeField = function(apiRes){
	var timeField = '';
	if(apiRes.query){
		if(apiRes.query.query){
			var dateDomain = apiRes.query.query['date_domain'];
			if(dateDomain && dateDomain.length > 0){
				timeField = dateDomain[0];
			}
		}

		if(apiRes.query.compareMap && apiRes.query.compareMap.length >0){
			var comparer = apiRes.query.compareMap[0];
			var compare =comparer.compare;
			var dateDomain = compare['date_domain'];
			if(dateDomain && dateDomain.length > 0){
				timeField = dateDomain[0];
			}
		}
	}
	return timeField;
}

ResponseParser.prototype.getUIObjectForAggregation = function(agg){
	var uiObject = {};
	var i = 1;
	Object.keys(agg).forEach((function(a){
		var k = 'key' + i;
		uiObject[k] = {};
		this.addNodesRecurssive(uiObject[k], agg[a], a);
		i++;
	}).bind(this));
	return uiObject;	
}

ResponseParser.prototype.addNodesRecurssive = function(obj, apiObj, strRootKey){
	var self = this;
	obj.key = strRootKey;
	obj.items = [];
	if(apiObj.buckets){
		apiObj.buckets.forEach(function(bucket){
			var bKeys = Object.keys(bucket);
			var item = { key : '', items : [] };	
			bKeys.forEach(function(bKey){													
				if(typeof(bucket[bKey]) === 'object'){
					var t = {key : ''};
					item.items.push(t);
					var items = bucket[bKey];
					if(bucket[bKey][bKey]){
						items = bucket[bKey][bKey];
					}
					self.addNodesRecurssive(t, items, bKey);
				}
				else
					item[bKey] = bucket[bKey];				
			});	
			obj.items.push(item);			
		});
	}
}
module.exports = ResponseParser;