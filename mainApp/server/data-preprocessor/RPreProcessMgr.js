var shortid = require('shortid');
var dataSetsDB = require('../mongoDB/dataSetsDB');
var rio = require("rio");
var tempDataDB = require('../mongoDB/tempDataDB');

var RPreProcessMgr= {
	preProcessDataSet:function(userId,dataset){
		return this.processByR(userId,dataset)
					.then(function(headers){
						return this.addHeaders(headers,dataset,userId);
					}.bind(this))
	},

	CreateHeadersFromRResponse:function(data,dataSet){
		var headerArr = [];
		var finData = JSON.parse(data);
		var HeaderTypeMap = finData.headerType;
		var headerDateRangeMap = finData.headerDateRange;

		for(var header in HeaderTypeMap){
			var headerJson = {};
			headerJson.id = shortid.generate();
			headerJson.header = header;
			headerJson.userName = header;
			headerJson.type = HeaderTypeMap[header];
			headerJson.fileId = dataSet.id;
			headerJson.dateRange = headerDateRangeMap[header];
			headerArr.push(headerJson);
		}
		return headerArr;
	},

	addHeaders:function(headers,dataSet,userId){
		dataSet.headers = headers;
		return dataSetsDB.updateDataSet(userId,dataSet);
	},

	processByR:function(userId,dataSet){
		var data = {
			path:dataSet.filePath,
			collection:tempDataDB.getCollectionName(dataSet.id)
			//cd: __dirname
		};

		return rio.$e({
		    command: "preProcess('"+JSON.stringify(data)+"')"
		})
		.then(function(data){
			return this.CreateHeadersFromRResponse(data,dataSet);
		}.bind(this));
	}
}

process.on("message", function (message) {
    RPreProcessMgr.preProcessDataSet(message.userId,message.dataset)
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

module.exports = RPreProcessMgr;