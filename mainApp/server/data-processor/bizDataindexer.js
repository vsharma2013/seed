var indexBuilder = require('./indexBuilder');
var bizDataManager = require('./bizDataManager');
var commonUtils = require('../utils/commonUtils');
var config = require('../../config/config');
var promise = require('bluebird');
var all = promise.all;
var map = promise.map;

var bizDataIndexer = function(){
	this.bizDataManager = new bizDataManager();
}
bizDataIndexer.prototype = {
	initIndexingForBusinessData:function(fileId,headers,callback){
		var self = this;
		
		var indexName = commonUtils.getIndexNameForBusinessData(fileId);
		return indexBuilder.deleteIndex(indexName)
			.then(function(flg){
				return indexBuilder.createIndex(indexName);
			}).then(function(){
				return map(headers,function(headerJson){
					if(this.isStringTypeHeader(headerJson)){
						return this.initMappingForBusinessDataForEachHeader(fileId,headerJson);
					}
					return null;
				}.bind(this));
			}.bind(this))
			.then(function(){
				return this.initMappingForBusinessDomainData(fileId);
			}.bind(this));
	},

	initMappingForBusinessDataForEachHeader:function(fileId,headerJson){
		var self = this;
		var indexName = commonUtils.getIndexNameForBusinessData(fileId);
		var type = commonUtils.getTypeNameForBusinessData(fileId,headerJson.id);
		
		var mapping = self.getMappingForBusinessData(indexName,type,headerJson.type);
		return indexBuilder.putMapping(mapping,indexName,type);
	},

	initMappingForBusinessDomainData:function(fileId){
		var domainType = commonUtils.getDomainBizDataTypeName();
		var indexName = commonUtils.getIndexNameForBusinessData(fileId);
		var indexType = commonUtils.getTypeNameForBusinessData(fileId,domainType);
		var mapping = this.getMappingForBusinessData(indexName,indexType,config.typeEnum.STRING);

		return indexBuilder.putMapping(mapping,indexName,indexType)
	},

	handleIndexingForBusinessData:function(fileId,csvData,headerData){
		var headerBizDataMap = this.bizDataManager.generateColumnLevelData(csvData,headerData);
		
		return map(headerData,function(headerjson){
			var header = headerjson.header;
			var headerBizData = headerBizDataMap[header];
			if(this.isStringTypeHeader(headerjson)){
				return this.handleIndexingForBusinessDataHeaders(fileId,headerBizData,headerjson);
			}
			return null;
		}.bind(this))
		.then(function(){
			return this.handleIndexingForBusinessDomainData(fileId,headerBizDataMap);
		}.bind(this))
	},

	isStringTypeHeader:function(headerjson){
		var dataType = headerjson.type;
		if(dataType == config.typeEnum.STRING){
			return true;
		}
		return false;
	},

	handleIndexingForBusinessDataHeaders:function(fileId,headerBizData,headerJson){
		var self = this;
		var indexName = commonUtils.getIndexNameForBusinessData(fileId);
		var type = commonUtils.getTypeNameForBusinessData(fileId,headerJson.id);
		return indexBuilder.addDataToIndex(headerBizData,indexName,type);
	},

	handleIndexingForBusinessDomainData:function(fileId,headerBizDataMap){
		var domainType = commonUtils.getDomainBizDataTypeName();
		var headerBizData = headerBizDataMap[domainType];
		var indexName = commonUtils.getIndexNameForBusinessData(fileId);
		var type = commonUtils.getTypeNameForBusinessData(fileId,domainType);
		return indexBuilder.addDataToIndex(headerBizData,indexName,type);
	},

	dispose:function(){
		return new promise(function(resolve){
			this.bizDataManager.dispose();
			this.bizDataManager = null;
			resolve();
		}.bind(this));
	},

	getMappingForBusinessData:function(indexName,type,dataType){
		var typeEnum = config.typeEnum;
		var mapping = {};
		if(dataType == typeEnum.NUMBER){
			mapping[type] = {
				'properties':{
					"name": {
	                    "type": "double"
	                },
	                "type": {
	                    "type": "string",
	                    "index": "not_analyzed"
	                },
	                "values": {
	                    "type": "double"
	                },
	                "exact_values": {
	                    "type": "string",
	                    "index": "not_analyzed"
	                }
				}
			}
		}
		else if (dataType == typeEnum.DATE){
			mapping[type] = {
				'properties':{
	                "type": {
	                    "type": "string",
	                    "index": "not_analyzed"
	                }
				}
			}
		}
		else{
			mapping[type] = {
				'properties':{
					"name": {
	                    "type": "string",
	                    "index": "not_analyzed"
	                },
	                "type": {
	                    "type": "string",
	                    "index": "not_analyzed"
	                },
	                "values": {
	                    "type": "string"
	                },
	                "exact_values": {
	                    "type": "string",
	                    "index": "not_analyzed"
	                }
				}
			}
		}
		return mapping;
	}
}

module.exports = bizDataIndexer;