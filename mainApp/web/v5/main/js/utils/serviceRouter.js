(function(NS){
	var serviceUrl = '';
	var utils = NS.utils;

	var serviceRouter = {
		getDataSetsData:function(callback){
			callback(dataSets)
		},

		getDashboardData:function(callback){
			callback(dashboards)
		},

		getAllData:function(callback){
			var url = '/api/_userdata';
			utils.getRequest(url,callback);
		},

		getQueriesData:function(callback){
			var url = '/api/_query';
			utils.getRequest(url,callback);
		},

		saveQueryData:function(query,callback){
			var url = '/api/_query/' + query.id;
			utils.postRequest(url,query,callback);
		},

		saveDataSet:function(data,callback){
			var url = '/api/_ds/' + data.id;
			utils.postRequest(url,data,callback);
		},

		getDataSetState:function(id,callback){
			var url = '/api/_ds/_state/' + id;
			utils.getRequest(url,callback);
		},

		updateDataSet:function(data,callback){
			var url = '/api/_ds/' + data.id;
			utils.putRequest(url,data,callback);
		},

		deleteDataSet:function(id,callback){
			var url = '/api/_ds/' + id;
			utils.deleteRequest(url,{},callback);
		},

		processDataSet:function(dataset,callback){
			var url = '/api/_ds/_process/' + dataset.id;
			utils.postRequest(url,dataset,callback);
		},

		saveDashboard:function(data,callback){
			var url = '/api/_dash/' + data.id;
			utils.postRequest(url,data,callback);
		},

		updateDashboard:function(data,callback){
			var url = '/api/_dash/' + data.id;
			utils.putRequest(url,data,callback);
		},

		deleteDashboard:function(id,callback){
			var url = '/api/_dash/' + id;
			utils.deleteRequest(url,{},callback);
		},

		logOutApp:function(callback){
			var url = '/api/logout';
			utils.getRequest(url,callback);
		},

		searchText:function(queryStr,fileId,callback){
			var url = '/api/searchdisplay?q=' + encodeURIComponent(queryStr) + '&id='+ fileId;
			utils.getRequest(url,callback);
		},

		searchQueryObj:function(fileId,queryObj,callback){
			var url = '/api/search/obj';
			var data = {
				fileId:fileId,
				query:queryObj
			};
			utils.postRequest(url,data,callback);
		},

		searchTextByDisplay:function(queryStr,fileId,display,timeField,callback){
			var url = '/api/searchdisplay?q=' + encodeURIComponent(queryStr) + '&id='+ fileId + '&display=' + display+ ((timeField && timeField!='')?'&timeField='+timeField:'');
			utils.getRequest(url,callback);
		},

		searchQueryObjByDisplay:function(fileId,query,display,timeField,callback){
			var url = '/api/searchdisplay/obj';
			var data = {
				fileId:fileId,
				query:query,
				display:display,
				timeField:timeField
			};
			utils.postRequest(url,data,callback);
		},

		validateUser:function(email,callback){
			var url = '/api/_dash/_share/_val';
			var data = {
				'email':email
			};
			utils.postRequest(url,data,callback);
		},

		shareDashboard:function(dashboardId,sharedUserIds,callback){
			var url = '/api/_dash/_share/' + dashboardId;
			var data = {
				userIds:sharedUserIds
			};
			utils.postRequest(url,data,callback);
		},

		getOutliers : function(model, currentDisplay, callback){
			if(!currentDisplay) {
				alert('line cannot be empty');
				return ;
			}
			var url = '/api/ol?q='+model.queryStr+'&id='+model.dataId+'&line='+ currentDisplay;
			utils.getRequest(url, callback);
		},

		getQuerySuggestionsData : function(fileId, callback){
			var url = '/api/qmeta/' + fileId;
			utils.getRequest(url, callback);
		},

		getQuerySuggestions : function(fileId, queryObj, callback){
			var url = '/api/qs/' + fileId + '/' + btoa(JSON.stringify(queryObj));
			utils.getRequest(url, callback);
		},

		getDataSetHierarchyData:function(dataSetId,callback){
			var url = '/api/_ds/_hier/' + dataSetId;
			utils.getRequest(url, callback);
		},

		saveHierarchyData:function(dataSetId,data,callback){
			var url = '/api/_ds/_hier/' + dataSetId;
			var d = {'data':JSON.stringify(data)};
			utils.putRequest(url,d,callback);
		}
	}

	NS.serviceRouter = serviceRouter;
})(window);