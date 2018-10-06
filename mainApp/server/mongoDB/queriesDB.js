var mongoDB = require('./mongoDB');
var collectionName = require('../../config/config').mongoConfig.queriesCollectionName;

var queriesDB = {
	'addQueriesDB':function(userId,doc,callback){
		doc.userId = userId;
		doc.createdDate = new Date().toString();
		return mongoDB.insertDocuments(collectionName,[doc]);
	},

	getQueriesByUserId:function(userId){
		var doc = {
			userId:userId
		};

		return mongoDB.findDocuments(doc,collectionName);
	},

	deleteQueriesByDataId:function(userId,dataId){
		var doc = {
			'userId':userId,
			'dataId':dataId
		}
		return mongoDB.deleteDocument(collectionName,doc);
	},

	deleteAllQueries:function(){
		return mongoDB.removeAllDocuments(collectionName);
	}
};

module.exports = queriesDB;