var dataSetDB = require('../mongoDB/dataSetsDB');
//var indexBuilderMgr = require('../data-processor/indexbuilderMgr');
//var hierarchyManager = require('../hierarchy-extractor/hierarchyManager');
//var dataPreProcessorMgr = require('../data-preprocessor/dataPreProcessMgr');
var logger = require('./../utils/Logger');
var workerUtils = require('../utils/workerUtils');
var cp = require("child_process");
var indexBuilderMgr = new workerUtils("/../data-processor/indexbuilderMgr");
var hierarchyManager = new workerUtils('/../hierarchy-extractor/hierarchyManager');
var dataPreProcessorMgr = new workerUtils('/../data-preprocessor/RPreProcessMgr');
var promise = require('bluebird');

var fileProcessController = {
    processDataSet:function(req,res){
    	var userId = req.user.id;
    	var dataSet = req.body;
    	dataSetDB.updateDataSet(userId,dataSet)
            .then(function(){
                res.json({success:1,message:"files indexing started"});
                return this.preProcessFile(userId,dataSet);
            }.bind(this))
            .then(function(){
                return dataSetDB.getDataSetById(dataSet.id);
            }.bind(this))
    		.then(function(dataset){
                dataSet = dataset;
                logger.log('File pre process Done');
    			return this.processFile(userId,dataSet);
    		}.bind(this))
    		.then(function(){
    			dataSet.state = 5; //searchable dataset
    			return dataSetDB.updateDataSet(userId,dataSet);
    		})
    		.then(function(){
    			logger.log('File processed and created Successfully');
    		}).
    		catch(function(err){
                console.log('error',err);
				logger.log(err.stack);
    		});
    },

    getFileState:function(req,res){
        var userId = req.user.id;
        var datasetId = req.params.id;
        dataSetDB.getDataSetById(datasetId)
            .then(function(row){
                res.json({'status':200,'data':row?row.state:null});
            })
            .catch(function(error){
                console.log('error',error);
                logger.log(err.stack);
            });;
    },

    preProcessFile:function(userId,dataset){
        return dataPreProcessorMgr.send({
            userId:userId,
            dataset:dataset
        });
    },

	processFile:function(userId,dataSet){
        logger.log('file process start');
		return this.handleIndexingOfCSVData(userId,dataSet).then(function(){
            logger.log('hierarchy process start');
			return this.handleDataHierarchyGeneration(dataSet);
		}.bind(this));
	},

	handleIndexingOfCSVData:function(userId,fileDetails){
        var message = {
            userId:userId,
            fileDetails:fileDetails
        }
        return indexBuilderMgr.send(message);
		
	},

	handleDataHierarchyGeneration:function(fileId){
        var message = {
            fileId:fileId
        };
        return hierarchyManager.send(message);
	}
}

module.exports = fileProcessController;