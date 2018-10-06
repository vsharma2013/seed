var mongoDB = require('./mongoDB');
var collectionName = require('../../config/config').mongoConfig.dashboardShareCollectionName;

var dashboardShare = {
	insertShareDashboardDocs:function(userId,userName,dashboardId,sharedUserIds){
		var docs = [];
		for(var i=0;i<sharedUserIds.length;i++){
			docs.push({
				'userId':userId,
				'userName':userName,
				'dashboardId':dashboardId,
				'sharedUserId':sharedUserIds[i],
				'createdDate':new Date().toString()
			})
		}
		return mongoDB.insertDocuments(collectionName,docs);
	},

	getSharedDashboardBySharedUserId:function(userId){
		var doc = {
			sharedUserId:userId
		};
		return mongoDB.findDocuments(doc,collectionName);
	},

	deleteSharedDashboardBySharedUserId:function(userId,dashboardId,sharedUserId){
		var doc = {
			'userId':userId,
			'dashboardId':dashboardId,
			'sharedUserId':sharedUserId
		}
		return mongoDB.deleteDocument(collectionName,doc);
	},

	deleteSharedDashboardByDashboardId:function(userId,dashboardId){
		var doc = {
			'userId':userId,
			'dashboardId':dashboardId
		}
		return mongoDB.deleteDocument(collectionName,doc);
	}
};

module.exports = dashboardShare;