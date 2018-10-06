var dataSetDB = require('../mongoDB/dataSetsDB');
var dashboardsDB = require('../mongoDB/dashboardsDB');
var queriesDB = require('../mongoDB/queriesDB');
var hierarchyDB = require('../mongoDB/hierarchyDB');
var userDB = require('../mongoDB/userDB');
var dashboardShareDB = require('../mongoDB/dashboardShareDB');
var promise = require('bluebird');
var join = promise.join; 
var logger = require('./../utils/Logger');

function handleException(err){
	//console.log(error);
	logger.log(err.stack);
}

var newDashboardCtrl = {
	getAllDataForUser:function(req,res){
		var userId = req.user.id;
		join(this.getAllDataSetsForUser(userId),this.getAllDashboardsForUser(userId),this.getAllShareDashboards(userId),function(dataSets,dashboards,sharedDashboards){
			var userData = {};
			userData['dataSets'] = dataSets;
			userData['dashboards'] = dashboards;
			userData['sharedDashboards'] = sharedDashboards;
			res.json({'status':200, 'data':userData});
		})
		.catch(handleException);
	},

	getAllDataSetsForUser:function(userId){
		return dataSetDB.getDataSetByUserId(userId);
	},

	getAllDashboardsForUser:function(userId){
		return dashboardsDB.getDashboardsByUserId(userId);
	},

	getAllQueriesForUser:function(req,res){
		var userId = req.user.id;
		queriesDB.getQueriesByUserId(userId)
			.then(function(rows){
				res.json({'status':200, 'data':rows});
			},handleException)
			.catch(handleException);
	},

	getHierarchyForDataSet:function(req,res){
		var userId = req.user.id;
		var dataSetId = req.params.id;
		hierarchyDB.getHierarchyDoc(dataSetId)
			.then(function(hierarchy){
				var data = hierarchy[hierarchy.length -1].heararchy;
				res.json({status:200,'data':data});
			},handleException)
			.catch(handleException);
	},

	saveHierarchyForDataSet:function(req,res){
		var userId = req.user.id;
		var dataSetId = req.params.id;
		var doc = JSON.parse(req.body.data);
		hierarchyDB.updateHierarchyDocs(dataSetId,doc)
				.then(function(){
					res.json({status:200,'data':{'message':'Updated Successfully'}});
				},handleException)
			.catch(handleException);
	},

	addNewDataSet:function(req,res){
		var body = req.body;
		var userId = req.user.id;
		dataSetDB.addDataSet(userId,body)
			.then(function(){
				return dataSetDB.getDataSetById(body.id)
			})
			.then(function(row){
				res.json({status:200,'data':row});
			},handleException)
			.catch(handleException);
	},

	updateNewDataSet:function(req,res){
		var body = req.body;
		var userId = req.user.id;
		dataSetDB.updateDataSet(userId,body)
			.then(function(results){
				res.json({status:200});
			},handleException)
			.catch(handleException);
	},

	deleteDataSet:function(req,res){
		var userId = req.user.id;
		var dataSetId = req.params.id;
		dataSetDB.deleteDataSet(userId,dataSetId)
		.then(function(){
			res.json({status:200});
		},handleException)
		.catch(handleException);
	},

	addNewDashboard:function(req,res){
		var body = req.body;
		var userId = req.user.id;
		var name = req.user.fullName;

		dashboardsDB.addDashboard(userId,body,name)
			.then(function(){
				return dashboardsDB.getDashboardById(body.id);
			},handleException)
			.then(function(data){
				res.json({status:200,data:data});
			},handleException)
			.catch(handleException);
	},

	updateDashboard:function(req,res){
		var body = req.body;
		var userId = req.user.id;
		var name = req.user.fullName;
		dashboardsDB.updateDashboard(userId,body,name)
			.then(function(results){
				res.json({status:200});
			},handleException)
			.catch(handleException);
	},

	deleteDashboard:function(req,res){
		var userId = req.user.id;
		var dashboardId = req.params.id;
		dashboardsDB.deleteDashboard(userId,dashboardId)
		.then(function(){
			res.json({status:200});
		},handleException)
		.catch(handleException);
	},

	addNewQuery:function(req,res){
		var body = req.body;
		var userId = req.user.id;
		queriesDB.addQueriesDB(userId,body)
			.then(function(results){
				res.json({status:200});
			},handleException)
			.catch(handleException);
		
	},

	resetAllData:function(req,res){
		join(dataSetDB.deleteAllDataSets(),dashboardsDB.deleteAllDashbaords(),queriesDB.deleteAllQueries(),hierarchyDB.deleteAllHiearchies(),
			function(){
				res.json({status:200});
			});
	},

	validateUsers:function(req,res){
		var body = req.body;
		var userId = req.user.id;
	    var username = req.user.username;

		var email = decodeURIComponent(body.email);
		userDB.getIdByUserName(email)
			.then(function(user){
				var data = {
					'isValid':0,
					'userId':null
				}
				if(user && email != username){
					data.isValid = 1;
					data.userId = user.id;
				}
				res.json({status:200,data:data});
			})
	},

	getShareDashboards:function(userId){
		return dashboardShareDB.getSharedDashboardBySharedUserId(userId)
				.then(function(rows){
					var dashboardIdMap = {};
					rows.forEach(function(row){
						dashboardIdMap[row.dashboardId] = row;
					});
					return dashboardIdMap;
				});
	},

	getAllShareDashboards:function(userId){
		var dashboardMap = {};
		return this.getShareDashboards(userId)
			.then(function(dashboardIdMap){
				dashboardMap = dashboardIdMap;
				var dashboardIds = Object.keys(dashboardIdMap);
				return dashboardsDB.getDashboardByMutipleIds(dashboardIds);
			})
			.then(function(rows){
				var sharedDashboards = [];
				if(rows && rows.length > 0){
					for(var i=0;i<rows.length;i++){
						var dashboard = rows[i];
						var sharedDashboard = dashboardMap[dashboard.id];
						sharedDashboard.dashboard = dashboard;
						sharedDashboards.push(sharedDashboard);
					}
				}
				return sharedDashboards;
			});
	}
	
}
module.exports = newDashboardCtrl;