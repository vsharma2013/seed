var chartTypes = {
	'3DPIE':1,
	'TIMELINE':2
};

var tabTypes = {
	'DATASETS':1,
	'DASHBAORDS':2,
	'DASHBOARDPANEL':3,
	'SEARCH':4,
	'DRILL':5
};

var dataSetState = {
	'ADDED':1,
	'UPLOADED':2,
	'PROCESSING':3,
	'PROCESSED':4,
	'SEARCH':5
};

var users = [{
	'id':1,
	'username':'test',
	'password':'test'
}]

var dataSets = [{
	'id':'dataSet_1',
	'userId':1,
	'name':'dataset 1',
	'description':'Sales Data',
	'state':1,
	'fileName':'',
	'filePath':''
},{
	'id':'dataSet_2',
	'name':'dataset 2',
	'description':'Money Data',
	'state':3,
	'userId':1,
	'fileName':'test.csv',
	'filePath':'test.csv'
},{
	'id':'dataSet_3',
	'name':'dataset 3',
	'description':'Somehow Data',
	'state':5,
	'userId':1,
	'fileName':'test.csv',
	'filePath':'test.csv'
}];

var queries = [{
	'id':'query_1',
	'queryStr':'car in west',
	'dataId':'dataSet_3',
	'userId':1
},{
	'id':'query_1',
	'queryStr':'car in east',
	'dataId':'dataSet_3',
	'userId':1
},{
	'id':'query_2',
	'queryStr':'mobile in west',
	'dataId':'dataSet_3',
	'userId':1
},{
	'id':'query_3',
	'queryStr':'mobile in east',
	'dataId':'dataSet_3',
	'userId':1
}];

var dashboards = [{
	'id':'dashboard_1',
	'name':'dashboard 1',
	'description':'CEO dashboard',
	'userId':1,
	'panels':[]
},{
	'id':'dashboard_2',
	'name':'dashboard 2',
	'description':'CXO dashboard',
	'userId':1,
	'sharedUserIds':[],
	'dataId':'dataSet_3',
	'panels':[{
		'id':'panel_1',
		'queryStr':'car in west',
		'title':'Cars',
		'description':'Showing state sales for west region',
		'chartType':1,
		'display':'state',
		'timeField':'',
		'chartSettings':{}
	},{
		'id':'panel_3',
		'queryStr':'car in west',
		'chartType':2,
		'title':'Cars',
		'description':'Showing state sales for west region',
		'display':'state',
		'timeField':'timestamp',
		'chartSettings':{
			'gtype':2
		}
	},{
		'id':'panel_2',
		'queryStr':'car in west',
		'chartType':1,
		'title':'Cars',
		'description':'Showing state sales for west region',
		'display':'region',
		'timeField':'',
		'chartSettings':{}
	}
	]
}];








