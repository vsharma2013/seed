var mongoDB = require('./mongoDB');
var collectionName = require('../../config/config').mongoConfig.tempCollectionName;

var tempDataDB = {
	'getPartialDoc':function(startInd,pageSize,dataSetId){
		return mongoDB.findPartialDocuments({'flgStale':0},startInd,pageSize,this.getCollectionName(dataSetId));
	},

	'insertDocs':function(docsArr,dataSetId){
		console.log(docsArr.length,'length');
		return mongoDB.insertDocuments(this.getCollectionName(dataSetId),docsArr);	
	},

	getCollectionName:function(dataSetId){
		return collectionName+'_' + dataSetId;
	},

	getDocumentCount:function(dataSetId){
		return mongoDB.getDocumentCountByQuery(this.getCollectionName(dataSetId),{'flgStale':0});
	},

	deleteCollection:function(dataSetId){
		return mongoDB.deleteCollection(this.getCollectionName(dataSetId));
	}
};

module.exports = tempDataDB;