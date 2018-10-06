var mongoDB = require('./mongoDB');
var collectionName = require('../../config/config').mongoConfig.dataSetCollectionName;
var uuid = require('node-uuid');
var config = require('../../config/config');
var moment = require('moment');
var queriesDB = require('./queriesDB');

var dataSetDB = {
	'addDataSet':function(userId,doc){
		doc.userId = userId;
		doc.createdDate = new Date().toString();
		return mongoDB.insertDocuments(collectionName,[doc]);
	},

	'deleteDataSet':function(userId,dataSetId){
		var doc = {
			'userId':userId,
			'id':dataSetId
		}
		return mongoDB.deleteDocument(collectionName,doc)
					.then(function(){
						return queriesDB.deleteQueriesByDataId(userId,dataSetId)
					});
	},

	'updateDataSet':function(userId,doc){
		var criteria = {
			userId:userId,
			id:doc.id
		};
		doc.updatedDate = new Date().toString();
		return mongoDB.updateDocuments(criteria,doc,collectionName);
	},

	deleteAllDataSets:function(){
		return mongoDB.removeAllDocuments(collectionName);
	},

	getDataSetByUserId:function(userId){
		var doc = {
			userId:userId
		};

		return mongoDB.findDocuments(doc,collectionName);
	},

	getDataSetById:function(id){
		var doc = {
			id:id
		};
		return mongoDB.findOneDocument(doc,collectionName);
	},

	createDataSetHeaders:function(dataSetId,headerRowMap){
		var headers = Object.keys(headerRowMap);
		var headerData = this.createDefaultHeaderData(headers,dataSetId,headerRowMap);
		return headerData;
	},

	createDefaultHeaderData:function(headerArr,fileId,headerDataMap){
		var headerObj = [];
		headerArr.forEach(function(header){
			var headerJson = {};
			headerJson.id = uuid.v4();
			headerJson.header = header;
			headerJson.userName = header;
			headerJson.type = this.getHeaderTypeBasedOnData(headerDataMap[header]);
			headerJson.fileId = fileId;
			headerObj.push(headerJson);
		}.bind(this));
		return headerObj;
	},

	getHeaderTypeBasedOnData:function(data){
		var typeEnum = config.typeEnum;
		var dataType = typeEnum.STRING;
		if(data != '' && !isNaN(data)){
			dataType = typeEnum.NUMBER;
		}
		else if(this.isDateType(data)){
			dataType = typeEnum.DATE;
		}
		return dataType;
	},

	isDateType:function(data){
		var formats = this.possibleDateFormats();
		var isValid = moment(data,formats,true).isValid();
		//if(isValid){
		//console.log(data,isValid,isValid);
		//}
		/*if(!isValid){
			//for format Mon Oct 01 2001 00:00:00 GMT+0530 (IST)
			var date = new Date(data);
			if(date == data){
				isValid = true;
			}
		}*/
		return isValid;
	},

	possibleDateFormats:function(){
		var dateFormats = config.dateFormats;
		var timeFormats = config.timeFormats;
		var formats = [moment.ISO_8601];
		for(var dInd in dateFormats){
			var dateFormat = dateFormats[dInd];
			formats.push(dateFormat);
			for(var tInd in timeFormats){
				var timeFormat = timeFormats[tInd];
				formats.push(dateFormat + ' ' + timeFormat);
				formats.push(dateFormat + 'T' + timeFormat);
			}
		}
		return formats; 
	}
};

module.exports = dataSetDB;