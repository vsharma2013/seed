var tempDataDB = require('../mongoDB/tempDataDB');

var rawDataDumper = {
	insertDataToTempDB:function(rows,dataSetId){
		return tempDataDB.insertDocs(rows,dataSetId);
	}
};

module.exports = rawDataDumper;