var config = require('../../config/config');
var commonUtils = require('../utils/commonUtils');

var bizDataManager = function(){
	this.uniqueValueMap = {};

	this.dispose = function(){
		this.uniqueValueMap = {};
	}

	this.generateColumnLevelData = function(data,headerData){
		var columnValueMaps = {};
		var headerJsonMap = {};
		//var uniqueValueMap = {};
		if(headerData && headerData.length > 0){
			headerData.forEach(function(headerJson){
				var header = headerJson.header;
				columnValueMaps[header] = [];
				headerJsonMap[header] = headerJson;
			});

			this.handleDataForDomain(columnValueMaps,headerJsonMap);

			data.forEach(function(rowJson){
				this.handleDataForEachRow(columnValueMaps,rowJson,headerJsonMap);
			}.bind(this));
		}
		return columnValueMaps;
	};

	this.handleDataForEachRow= function(headerValueMap,rowJson,headerJsonMap){
		var headers = Object.keys(headerJsonMap);
		headers.forEach(function(header){
			var headerJson = headerJsonMap[header];
			//var headerUserName = headerJson.userName;
			var value = rowJson[header];
			if(value != ''){
				if(!this.uniqueValueMap[value]){
					this.uniqueValueMap[value] = 1;
					var values = this.createExtendedValues(value,headerJson['type']);
					headerValueMap[header].push({
						'name':value,
						'type':header,
						'values':values,
						'exact_values':values
					});
				}
			}
		}.bind(this));
	};

	this.handleDataForDomain = function(columnValueMaps,headerJsonMap){
		var domainTypeName = commonUtils.getDomainBizDataTypeName();
		if(!columnValueMaps[domainTypeName]){
			columnValueMaps[domainTypeName] = [];
		}

		var headers = Object.keys(headerJsonMap);
		headers.forEach(function(header){
			var headerJson = headerJsonMap[header];
			//var headerUserName = headerJson.userName;
			if(!this.uniqueValueMap[header]){
				this.uniqueValueMap[header] = 1;
				var values = this.createExtendedValues(header);
				columnValueMaps[domainTypeName].push({
					'name':header,
					'type':this.getDomainTypeByHeaderType(headerJson['type']),
					'values':values,
					'exact_values':values
				});
			}
		}.bind(this));

	};

	this.getDomainTypeByHeaderType = function(type){
		var typeEnum = config.typeEnum;
		var domainTypeName = commonUtils.getDomainBizDataTypeName();
		if(type == typeEnum.DATE){
			domainTypeName = commonUtils.getDateDomainDateTypeName();
		}
		else if (type == typeEnum.NUMBER){
			domainTypeName = commonUtils.getNumberDomainDateTypeName();
		}
		return domainTypeName;
	},

	this.createExtendedValues = function(value,type){
		var typeEnum = config.typeEnum;
		var values = [];
		if(typeof value == 'undefined'){
			return values;
		}

		if(type == typeEnum.DATE){
			values = this.createExtendedValuesForDate(value);
		}
		else if (type == typeEnum.NUMBER){
			values = this.createExtendedValuesForInteger(value);
		}
		else{
			values = this.createExtendedValuesForString(value + '');
		}
		return values;
	};

	this.createExtendedValuesForString =function(value){
		var values = [];
		values.push(value);
		values.push(value.toLowerCase());
		values.push(value.toUpperCase());
		values.push(value.toLowerCase() + 's');
		return values;
	};

	this.createExtendedValuesForDate =function(value){
		var values = [];
		values.push(value);
		return values;
	};

	this.createExtendedValuesForInteger = function(value){
		var values = [];
		values.push(value);
		return values;
	}
}

module.exports = bizDataManager;