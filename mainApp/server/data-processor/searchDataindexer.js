var indexBuilder = require('./indexBuilder');
var commomUtils = require('../utils/commonUtils');
var config = require('../../config/config');

var searchDataIndexer = {
	initIndexingForSearchData:function(fileId,headerData){
		var indexName = commomUtils.getIndexNameForSearchData(fileId);
		var type = commomUtils.getTypeNameForSearchData(fileId);
		var mapping = this.getMappingForSearchData(indexName,type,headerData);
		
		return indexBuilder.deleteIndex(indexName)
					.then(function(flg){
						return indexBuilder.createIndex(indexName)
					})
					.then(function(flg){
						return indexBuilder.putMapping(mapping,indexName,type);
					})
				
	},

	handleIndexingForSearchData:function(fileId,csvData,callback){
		var indexName = commomUtils.getIndexNameForSearchData(fileId);
		var type = commomUtils.getTypeNameForSearchData(fileId);
		
		return indexBuilder.addDataToIndex(csvData,indexName,type);
	},

	totalCountOfRecordsInSearchData:function(fileId,callback){
		var indexName = commomUtils.getIndexNameForSearchData(fileId);
		return indexBuilder.checkDataCount(indexName);
	},

	getMappingForSearchData:function(indexName,type,headerData){
		var mapping = {};
		var typeEnum = config.typeEnum;
		var properties = {};
		headerData.forEach(function(headerJson){
			var header = headerJson.header;
			var type = headerJson.type;
			if(type == typeEnum.DATE){
				/*properties[header] = {
					"type": "date"
				}*/
			}
			else if(type == typeEnum.NUMBER){
				properties[header + '_mod'] = {
					"type": "double"
				}
			}
			else{

				properties[header] = {
					"type": "string",
                    "index": "not_analyzed"
				}
			}
			
		});
		mapping[type] = {
			'properties':properties
		};
		return mapping;
	}
};

module.exports = searchDataIndexer;

