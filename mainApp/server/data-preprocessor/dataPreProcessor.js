var config = require('../../config/config');
var typeEnum = config.typeEnum;
var rowPreProcessor = require('./rowPreProcessor');
var rawDataDumper = require('./rawDataDumper');

var dataPreProcessor = function(dataSetId){
	this.totalCount = 0;
	this.headerDataTypeCountMap = {};
	this.dataSetId = dataSetId;
	this.start = false;
	this.stop = false;
	this.remainingHeaders = [];
};

dataPreProcessor.prototype = {
	dumpAllData:function(rows){
		//console.log(rows.length);
		return rawDataDumper.insertDataToTempDB(rows,this.dataSetId);
	},

	preProcessEachRow:function(row){
		if(!this.stop){
			if(!this.start){
				this.start = true;
				var rowHeaderDataTypeMap = rowPreProcessor.preProcessEntity(row);
				this.handleHeaderDataCountMap(rowHeaderDataTypeMap);
				this.remainingHeaders = Object.keys(this.headerDataTypeCountMap);
			}
			else{
				this.getHeaderWithUnknownAndDateHeaders();
				if(this.remainingHeaders && this.remainingHeaders.length > 0){
					var rowHeaderDataTypeMap = rowPreProcessor.processHeaders(this.remainingHeaders,row);
					this.handleHeaderDataCountMap(rowHeaderDataTypeMap);
				}
				else{
					this.stop = true;
				}
			}
		}
		
		this.totalCount++;
		//console.log(this.totalCount);
	},

	getHeaderWithUnknownAndDateHeaders:function(){
		var headers = [];
		this.remainingHeaders.forEach(function(header){
			var typeCountMap = this.headerDataTypeCountMap[header];
			var keys = Object.keys(typeCountMap);
			if(keys.length == 0 || (keys.length ==1 && typeCountMap[typeEnum.NOTYPE])){
				headers.push(header);
			}

			if(typeCountMap[typeEnum.DATE] && !typeCountMap[typeEnum.STRING]){
				headers.push(header);
			}

			if(typeCountMap[typeEnum.NUMBER] && !typeCountMap[typeEnum.STRING]){
				headers.push(header);
			}
		}.bind(this));
		this.remainingHeaders = headers;
	},

	getHeaderDataTypeCountMap:function(){
		return this.headerDataTypeCountMap;
	},

	handleHeaderDataCountMap:function(rowHeaderDataTypeMap){
		for(var header in rowHeaderDataTypeMap){
			var dataType = rowHeaderDataTypeMap[header];

			if(!this.headerDataTypeCountMap[header]){
				this.headerDataTypeCountMap[header] = {};
			}
			var dataTypeCountMap = this.headerDataTypeCountMap[header];

			if(!dataTypeCountMap[dataType]){
				dataTypeCountMap[dataType] = 0;
			}
			dataTypeCountMap[dataType]++;
		}
	},
	dispose:function(){
		this.headerDataTypeCountMap = {};
		this.totalCount = 0;
		this.start = false;
	}
}

module.exports = dataPreProcessor;