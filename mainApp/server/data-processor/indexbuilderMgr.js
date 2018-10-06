var bizDataindexer = require('./bizDataindexer');
var searchDataindexer = require('./searchDataindexer');
var fileReader = require('../fileHandler/fileReader');
var promise = require('bluebird');
var map = promise.map;
var tempDataDB = require('../mongoDB/tempDataDB');

var indexBuilderMgr = function(){
	this.bizDataindexer = new bizDataindexer();
	this.actualRecords = 0;
	this.totalRecords = 0;
}

indexBuilderMgr.prototype = {
	handleIndexing:function(userId,dataSet){
		var self = this;
		var headerData = dataSet.headers;

		return this.initMappingAndIndexCreationForData(dataSet.id,headerData)
			.then(function(){
				console.log('index creation done');
				return this.dateExtractFromTemp(dataSet,headerData);
			}.bind(this))
			.then(function(recordsJson){
				console.log('data extract from csv done');
				return this.checkDataAvailableForSearch(dataSet.id,this.actualRecords)
			}.bind(this));
			/*.then(function(){
				return this.deleteTempDB(dataSet.id);
			}.bind(this));*/

		/*return this.initMappingAndIndexCreationForData(dataSet.id,headerData)
			.then(function(){
				console.log('index creation done');
				return this.dateExtractFromCSV(dataSet,headerData);
			}.bind(this))
			.then(function(recordsJson){
				console.log('data extract from csv done');
				return this.checkDataAvailableForSearch(dataSet.id,recordsJson.actualRecords)
			}.bind(this));*/
	},

	initMappingAndIndexCreationForData:function(fileId,headerData,callback){
		return this.bizDataindexer.initIndexingForBusinessData(fileId,headerData)
					.then(function(){
						console.log('index creation business data done');
						return searchDataindexer.initIndexingForSearchData(fileId,headerData);
					});
	},

	dateExtractFromCSV:function(fileDetails,headerData,callback){
		var self = this;
		var totalRecords = 0;
		var actualRecords = 0;
		return new promise(function(resolve){
			fileReader.readDataFromCSV(fileDetails.filePath,false,function(partialObj){
				var partialCSVData = partialObj.data;
				var partialCallback = partialObj.callback;
				this.handlePartialIndexing(fileDetails,headerData,partialCSVData).then(function(resp){
					actualRecords += this.getFinIndexRecords(resp);
					totalRecords += (resp?resp.total:0);
					console.log("Records Processed " + totalRecords + ". Records with error " + (totalRecords - actualRecords));
					if(partialCallback){
						partialCallback();
					}
					else{
						resolve({'totalRecords':totalRecords,'actualRecords':actualRecords});
					}
				}.bind(this));
			}.bind(this));
		}.bind(this));
	},

	deleteTempDB:function(dataSetId){
		return tempDataDB.deleteCollection(dataSetId);
	},

	dateExtractFromTemp:function(fileDetails){
		var self = this;
		var totalRecords = 0;
		var actualRecords = 0;
		return this.getRecordsStepObj(fileDetails.id)
					.then(function(stepsArr){
						return map(stepsArr,function(step){
									var startInd = step.startInd;
									var pageSize = step.pageSize;
									return this.handleIndexingForEachStep(startInd,pageSize,fileDetails);
								}.bind(this));
					}.bind(this));
	},

	handleIndexingForEachStep:function(startInd,pageSize,dataSet){
		return tempDataDB.getPartialDoc(startInd,pageSize,dataSet.id)
					.then(function(data){
						return this.handlePartialIndexing(dataSet,dataSet.headers,data);
					}.bind(this))
					.then(function(resp){
						this.actualRecords += this.getFinIndexRecords(resp);
						this.totalRecords += (resp?resp.total:0);
						console.log("Records Processed " + this.totalRecords + ". Records with error " + (this.totalRecords - this.actualRecords));
						return {'totalRecords':this.totalRecords,'actualRecords':this.actualRecords};
					}.bind(this))
	},

	getRecordsStepObj:function(dataSetId){
		return tempDataDB.getDocumentCount(dataSetId)
					.then(function(totalCount){
						var totalRecords = totalCount;
						var pageSize = 20000;
						var steps = Math.ceil(totalRecords/pageSize);
						var stepsArr = [];
						for(var i=0;i<steps;i++){
							stepsArr.push({'startInd':i*pageSize,'pageSize':pageSize});
						}
						return stepsArr;
					});
	},

	getFinIndexRecords:function(resp){
		if(resp){
			var records = resp.total;
			var errorCount = resp.errorCount;
			return records - errorCount;
		}
		return 0;
	},

	checkDataAvailableForSearch:function(fileId,totalRecords){
		return new promise(function(resolve){
			this.getSearchCount(fileId)
				.then(function(count,err){
					//check count to make sure data is searchable
					if(totalRecords == count){
						resolve();
					}
					else{
						setTimeout(function(){
							this.checkDataAvailableForSearch(fileId,totalRecords)
								.then(resolve);
						}.bind(this),100);
					}
				}.bind(this));
		}.bind(this));
	},

	getSearchCount:function(fileId){
		return searchDataindexer.totalCountOfRecordsInSearchData(fileId);
	},

	handlePartialIndexing:function(fileDetails,headerData,partailCSVData){
		var self = this;
		return this.bizDataindexer.handleIndexingForBusinessData(fileDetails.id,partailCSVData,headerData)
			.then(function(flg){
				return searchDataindexer.handleIndexingForSearchData(fileDetails.id,partailCSVData)
			});
	},

	dispose:function(){
		return this.bizDataindexer.dispose();
	}

};

process.on("message", function (message) {
	var indexbuilderMgrObj = new indexBuilderMgr();
	indexbuilderMgrObj.handleIndexing(message.userId,message.fileDetails)
				.then(function(){
			        indexbuilderMgrObj.dispose();
			        indexbuilderMgrObj = null;
			         process.send({
			    		'success':true,
			    		'err':null
			    	});
			    })
			    .catch(function(err){
			    	console.log(err);
			    	process.send({
			    		'success':false,
			    		'err':err.stack
			    	});
			    });
});

module.exports = indexBuilderMgr;