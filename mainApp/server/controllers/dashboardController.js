var uploader = require('../fileHandler/fileUploader');
var indexBuilderMgr = require('../data-processor/indexbuilderMgr');
var headerProcessor = null;//require('../data-processor/header-processor');
var hierarchyManager = require('../hierarchy-extractor/hierarchyManager');
var uuid = require('node-uuid');

var dashboardCont = {
	handleFileUpload:function(req,res){
		//var dashboardId = req.body.dashboardId;
		
		uploader.uploadFile(req,req.user.id,function(fd,dashboardId){
			//var dashboardId = dashboardId;
			var fileSize = 0;
			fd.dashboardId = dashboardId;
			filedb.insertFile(fd.fileId,fd.fileName,fd.filePath,fd.fileExt,fileSize,dashboardId,function(err,flg){
				if(!err){
					headerProcessor.getHeaderDataFromFile(fd.fileId,fd.filePath,function(headerData){
						headerProcessor.saveHeaderData(headerData,function(){
							dashboardDb.updateExcelUploaded(dashboardId,function(){
								res.json({'fileData':fd,'headerData':headerData});
							});
						});
					});
				}
			});
	   });

	},

	handleFileUploadDummy:function(req,res){
		uploader.uploadFile(req,null,function(fd){
			res.json(fd);
		},true);
	},

	insertDefaultDashboard:function(req,res){
		var userId = req.user.id;
		var newDashBoardId = uuid.v4();
		dashboardDb.insertDefaultDashBoard(userId,newDashBoardId,function(err,flg){
			if(!err){
				dashboardDb.getDashBoardById(newDashBoardId,function(err,row){
					res.json(row);
				});
			}
		});
	},

	getAllDashBoardDataForUser:function(req,res){
		var userId = req.user.id;
		dashboardDb.getDashBoadsForUser(userId,function(err,rows){
			if(!err){
				var count = rows.length;
				if(rows && rows.length > 0){
					rows.forEach(function(row){
						var dashId = row.id;
						this.getAllFileDataForDashBoard(dashId,function(err,fileData){
							row.fileData = fileData;
							count--;
							if(count == 0){
								res.json(rows);
							}
						});
					}.bind(this));
				}
				else{
					res.json([]);
				}
			}
			else{
				res.json([]);
			}
		}.bind(this));
	},

	getAllFileDataForDashBoard:function(dashId,callback){
		filedb.getFilesByDashBoard(dashId,function(err,rows){
			if(!err){
				if(rows && rows.length > 0){
					var count = rows.length;
					rows.forEach(function(row){
						var id = row.id;
						this.getHeaderDataForFile(id,function(err,headerData){
							row.headerData = headerData;
							count--;
							if(count == 0){
								callback(null, rows);
							}
						});
					}.bind(this));
				}
				else{
					callback(null,[]);
				}
			}
			else{
				callback(err,[]);
			}
		}.bind(this));
	},

	getHeaderDataForFile:function(fileId,callback){
		headerdb.getHeaderData(fileId,function(err,rows){
			if(!err){
				callback(err,rows);
			}
			else{
				callback(err,[]);
			}
		});
	},

	handleDataIndexing:function(req,res){
		var userId = req.user.id;
		var fileId = req.body.fileId;
		this.initFileProcessing(userId,fileId);
		res.json({success:1,message:"files indexing started"});
	},

	initFileProcessing:function(userId,fileId){
		this.preFileProcess(userId,fileId);
	},

	preFileProcess:function(userId,fileId){
		this.updateFileProcessing(1,fileId,this.processFile.bind(this,userId,fileId));
	},

	postFileProcess:function(fileId){
		this.updateFileProcessed(fileId,function(){
			console.log("File indexed and hierarchy generated successfully");
		});
	},

	processFile:function(userId,fileId){
		filedb.getFileDetailsByFileId(fileId,function(err,fileDetails){
			this.handleIndexingOfCSVData(userId,fileDetails,function(){
				this.handleDataHierarchyGeneration(fileId,this.postFileProcess.bind(this,fileId));
			}.bind(this));
		}.bind(this));
	},

	handleIndexingOfCSVData:function(userId,fileDetails,callback){
		indexBuilderMgr.handleIndexing(userId,fileDetails,callback);
	},

	updateFileProcessing:function(flg,fileId,callback){
		filedb.updateFileProcessing(flg,fileId,callback);
	},

	updateFileProcessed:function(fileId,callback){
		filedb.updateFileProcessed(fileId,callback);
	},

	handleDataHierarchyGeneration:function(fileId,callback){
		hierarchyManager.getHierarchy(fileId,callback);
	},

	isFileProcessed:function(req,res){
		var fileId = req.body.fileId;
		filedb.isFileProcessed(fileId,function(err,row){
			res.json(row);
		});
	}
}

module.exports = dashboardCont;