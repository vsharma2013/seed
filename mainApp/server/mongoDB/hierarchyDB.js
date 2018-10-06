var mongoDB = require('./mongoDB');
var collectionName = require('../../config/config').mongoConfig.hierarchyCollectionName;

var hierarchyDB = {
	'getHierarchyDoc':function(fileId){
		return mongoDB.findDocuments({fileId:fileId},collectionName);
	},

	'insertHierarchyDocs':function(docsArr){
		return mongoDB.insertDocuments(collectionName,docsArr);	
	},

	'updateHierarchyDocs':function(fileId,doc){
		doc.updatedDate = Date.now();
		return mongoDB.updateDocuments({fileId:fileId},doc,collectionName);
	},

	'deleteHierarchyDoc':function(doc){
		return mongoDB.deleteDocument(collectionName,doc);
	},

	deleteAllHiearchies:function(){
		return mongoDB.removeAllDocuments(collectionName);
	}
};

module.exports = hierarchyDB;