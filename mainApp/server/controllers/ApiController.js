'use strict';

var _ = require('underscore');
var co = require('co');
var logger = require('./../utils/Logger');
var QueryParser = require('./../query-parser/QueryParser');
var QueryRunner = require('./../query-runner/QueryRunner');
var OutlierManager = require('./../outliers/OutlierManager');
var hierarchyDB = require('../mongoDB/hierarchyDB');
var queryMeta = require('./../query-meta/QueryMeta');

function ApiController(){

}

ApiController.prototype.handleDefaultRequest = function(req, res){
	var fileId = req.query.id;
	var queryRunner = new QueryRunner(fileId);
	queryRunner.getRoot(function(data){
		res.json(data);
	});
}

ApiController.prototype.handleDisplaySearchRequest = function(req, res){
	var queryParser = new QueryParser();
	var query = decodeURIComponent(req.query.q).toLowerCase();
	var display = req.query.display;
	var timeField = req.query.timeField;
	var fileId = req.query.id;
	queryParser.parse(query, fileId,this.onQueryParseResponse.bind(this, res,fileId,display,timeField));	
}

ApiController.prototype.handleSearchRequest = function(req, res){
	this.requestAt = Date.now();
	var queryParser = new QueryParser();
	var query = decodeURIComponent(req.query.q).toLowerCase();
	var dashBoardId = req.query.dbId;
	var fileId = req.query.id;
	queryParser.parse(query, fileId,this.onQueryParseResponse.bind(this, res,fileId,null,null));	
}

ApiController.prototype.handleSearchByQueryObj = function(req,res){
	var body = req.body;
	var fileId = body.fileId;
	var queryObj = body.query;
	this.onQueryParseResponse(res,fileId,null,null,{success:true,data:queryObj});
}

ApiController.prototype.handleDisplaySearchByQueryObj = function(req,res){
	var body = req.body;
	var fileId = body.fileId;
	var queryObj = body.query;
	var display = body.display;
	var timeField = body.timeField;
	this.onQueryParseResponse(res,fileId,display,timeField,{success:true,data:queryObj});
}

ApiController.prototype.onQueryParseResponse = function(respHttp,fileId,display,timeField, respQueryParse){
	if(!respQueryParse.success){
		respHttp.json({success:0,query:respQueryParse.data});
		return;
	}
	this.executeQuery(respQueryParse.data, respHttp,fileId,display,timeField);
}

ApiController.prototype.executeQuery = function(parsedQueryObject, respHttp,fileId,display,timeField){
	var queryRunner = new QueryRunner(fileId,display,timeField,parsedQueryObject.operator,parsedQueryObject.relationOperator);
	queryRunner.run(parsedQueryObject, this.onExecuteQueryResponse.bind(this, parsedQueryObject, respHttp,fileId));
}

ApiController.prototype.onExecuteQueryResponse = function(parsedQueryObject, respHttp,fileId, respExecQuery){
	this.getFinalHierarchyData(fileId,(function(finHierarchyData){
		respExecQuery.query = parsedQueryObject;
		respExecQuery.hierarchyData = finHierarchyData;
		respExecQuery.success = 1;
		respHttp.json({'status':200, 'data':respExecQuery});
		logger.log('Processing time : ' + Date.now() - this.requestAt);
	}).bind(this));
}

ApiController.prototype.getFinalHierarchyData = function(fileId,callback){
	hierarchyDB.getHierarchyDoc(fileId)
		.done(function(docs){
			callback(docs[0]);
		});
}

ApiController.prototype.handleSaveSalesStrategyRequest = function(req, res){
	var dataMgr = new DataManager();
	dataMgr.saveSalesStrategy(req, res);
}

ApiController.prototype.handleBuildSalesIndicesRequest = function(req, res){
	var dataMgr = new DataManager();
	dataMgr.buildSalesIndices(req, res);
}

ApiController.prototype.handleOutlierRequest = function(req, res){
	var outlierMgr = new OutlierManager(this);
	outlierMgr.handleOutlierRequest(req, res);
}

ApiController.prototype.GenerateGEPCSV = function(req, res){
	GEPCSVGenerator.createData();
	res.json({success:true,'message':'CSV generation starts'});
}

ApiController.prototype.handleQueryMetaRequest = function(req, res){
	this.execute(queryMeta.getQueryMetaData.bind(queryMeta), req, res);
}

ApiController.prototype.handleQuerySuggestionRequest = function(req, res){
	this.execute(queryMeta.getQuerySuggestions.bind(queryMeta), req, res);
}

ApiController.prototype.execute = function(executeGeneratorFn, httpReq, httpRes){
	function onSuccess(){}

	function onError(err) { 
		logger.log(err.stack);
		httpRes.json({success : false, data : null, message : 'Internal error while procesing the request'});
	}
	co(function* () {
		var result = yield executeGeneratorFn(httpReq);
		httpRes.json({
			status : !_.isEmpty(result) ? 200 : 500,
			data : _.isEmpty(result) ? null : result,
			message : ''
		});
	}).then(onSuccess, onError);
}

var gApiController = new ApiController();

module.exports = gApiController;