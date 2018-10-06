var dataPreProcessor = require('./dataPreProcessor');
var dataPreProcessorObj = null;
var promise = require('bluebird');
var shortid = require('shortid');
var config = require('../../config/config');
var typeEnum = config.typeEnum;
var dataSetsDB = require('../mongoDB/dataSetsDB');
var fileReader = require('../fileHandler/fileReader');

var dataPreProcessMgr= {
	preProcessDataSet:function(userId,dataSet){
		dataPreProcessorObj = new dataPreProcessor(dataSet.id);
		return this.dateExtractFromCSV(dataSet)
				.then(function(){
					return this.addHeadersToDataSet(userId,dataSet);
				}.bind(this))
				.then(function(){
					dataPreProcessorObj.dispose();
					dataPreProcessorObj = null;
					return true
				});
	},

	dateExtractFromCSV:function(fileDetails,callback){
		var self = this;
		return new promise(function(resolve){
			fileReader.readDataFromCSV(fileDetails.filePath,false,function(partialObj){
				var partialCSVData = partialObj.data;
				var partialCallback = partialObj.callback;
					//console.log(JSON.stringify(resp));
				dataPreProcessorObj.dumpAllData(partialCSVData).then(function(){
					if(partialCallback){
						partialCallback();
					}
					else{
						resolve();
					}
				});
			}.bind(this),function(row){
				dataPreProcessorObj.preProcessEachRow(row);
			});
		}.bind(this));
	},

	addHeadersToDataSet:function(userId,dataSet){
		var headers = this.createHeadersForDataSet(dataSet);
		dataSet.headers = headers;
		return dataSetsDB.updateDataSet(userId,dataSet);
	},

	createHeadersForDataSet:function(dataSet){
		var headerDataTypeCountMap = dataPreProcessorObj.getHeaderDataTypeCountMap();
		var headerArr = [];
		for(var header in headerDataTypeCountMap){
			var headerJson = {};
			headerJson.id = shortid.generate();
			headerJson.header = header;
			headerJson.userName = header;
			headerJson.type = this.getTypeBasedOnCount(headerDataTypeCountMap[header],header);
			headerJson.fileId = dataSet.id;
			headerArr.push(headerJson);
		}
		return headerArr;
	},

	getTypeBasedOnCount:function(typeCountMap,header){
		var retType = typeEnum.STRING;
		if(typeCountMap[typeEnum.STRING]){
			retType = typeEnum.STRING;
			return retType;
		}
		delete typeCountMap[typeEnum.NOTYPE];
		var typeKeys = Object.keys(typeCountMap);
		if(typeKeys && typeKeys.length == 1){
			retType =  parseInt(typeKeys[0]);
		}
		return retType;
	}

};

process.on("message", function (message) {
    dataPreProcessMgr.preProcessDataSet(message.userId,message.dataset)
    		.then(function(){
    			process.send({
		    		'success':true,
		    		'err':null
		    	});
    		})
    		.catch(function(err){
    			process.send({
		    		'success':false,
		    		'err':err
		    	});
    		})
});

module.exports = dataPreProcessMgr;