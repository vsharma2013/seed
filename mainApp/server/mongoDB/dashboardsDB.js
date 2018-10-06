var mongoDB = require('./mongoDB');
var dashboardShareDB = require('./dashboardShareDB');
var collectionName = require('../../config/config').mongoConfig.dashboardCollectionName;

var dashboardsDB = {
	'addDashboard':function(userId,doc,username){
		doc.userId = userId;
		doc.createdDate = new Date().toString();
		return mongoDB.insertDocuments(collectionName,[doc]).
						then(function(){
							return this.addSharedUserIds(doc,userId,username);
						}.bind(this));
	},

	'deleteDashboard':function(userId,dashboardId){
		var doc = {
			'userId':userId,
			'id':dashboardId
		}
		return mongoDB.deleteDocument(collectionName,doc)
				.then(function(){
					return dashboardShareDB.deleteSharedDashboardByDashboardId(dashboardId);
				});
	},

	deleteAllDashbaords:function(){
		return mongoDB.removeAllDocuments(collectionName);
	},

	'updateDashboard':function(userId,doc,username){
		var criteria = {
			userId:userId,
			id:doc.id
		};
		doc.updatedDate = new Date().toString();
		return mongoDB.updateDocuments(criteria,doc,collectionName)
						.then(function(){
							return dashboardShareDB.deleteSharedDashboardByDashboardId(userId,doc.id);
						}).
						then(function(){
							return this.addSharedUserIds(doc,userId,username);
						}.bind(this));
	},

	addSharedUserIds:function(dashboard,userId,username){
		var shareduserIds = [];
		var sharedUsers = dashboard.sharedUsers;
		if(sharedUsers){
			sharedUsers.forEach(function(user){
				shareduserIds.push(user.userId);
			});
		}
		if(shareduserIds && shareduserIds.length > 0){
			return dashboardShareDB.insertShareDashboardDocs(userId,username,dashboard.id,shareduserIds);
		}
		return true;
	},

	getDashboardByMutipleIds:function(ids){
		var doc = {
			id:{$in: ids}
		};
		return mongoDB.findDocuments(doc,collectionName);
	},

	getDashboardsByUserId:function(userId){
		var doc = {
			userId:userId
		};

		return mongoDB.findDocuments(doc,collectionName);
	},

	getDashboardById:function(id){
		var doc = {
			id:id
		};
		return mongoDB.findOneDocument(doc,collectionName);
	}
};

module.exports = dashboardsDB;