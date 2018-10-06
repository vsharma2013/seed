var config = require('../../config/config');
var typeEnum = config.typeEnum;
var moment = require('moment');

var entityPreProcessor = {
	preProcessEntity:function(entityRow){
		var headerDataTypeMap = {};

		for(var header in entityRow){
			this.processEachHeader(headerDataTypeMap,header,entityRow);
		}
		return headerDataTypeMap;
	},

	processHeaders:function(unknownHeaders,row){
		var headerDataTypeMap = {};
		unknownHeaders.forEach(function(header){
			this.processEachHeader(headerDataTypeMap,header,row);
		}.bind(this));
		return headerDataTypeMap;
	},

	processEachHeader:function(headerDataTypeMap,header,entityRow){
		var data = entityRow[header];
		var dataType = this.getHeaderTypeBasedOnData(data);
		headerDataTypeMap[header] = dataType;
		this.addModifiedDateInEntity(entityRow,header,dataType);
	},

	addModifiedDateInEntity:function(entityRow,header,dataType){
		if(dataType == typeEnum.DATE){
			entityRow[header + '_mod'] = this.getModifiedDateValue(entityRow[header]);
		}
	},

	getModifiedDateValue:function(data){
		var formats = this.possibleDateFormats();
		var modifiedDate = moment(data,formats).format('YYYY/MM/DD');
		//console.log(modifiedDate);
		return modifiedDate;
	},

	getHeaderTypeBasedOnData:function(data){
		var dataType = typeEnum.STRING;
		if(data == ''){
			dataType = typeEnum.NOTYPE;
		}
		else if(this.isValidNumber(data)){
			dataType = typeEnum.NUMBER;
		}
		else if(this.isDateType(data)){
			dataType = typeEnum.DATE;
		}
		return dataType;
	},

	isValidNumber:function(data){
		var test = data.replace(new RegExp(',', 'g'), '');
		/*var flg = true;
		for(var i=0;i<nums.length;i++){
			if(isNaN(nums[i])){
				flg = false;
				break;
			}
		}*/

		return !isNaN(test);
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

module.exports = entityPreProcessor;