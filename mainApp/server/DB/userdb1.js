var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/users.db');
createTableIfNotExist();
var userQuery = {
	getSaltByUserName :function(username,callback){
		console.log(db);
		db.get('SELECT salt FROM users WHERE username = ?', username, function(err, row) {
			callback(err,row);
		});
	},

	getUserDetailsByUserNameAndPass:function(username,hash,callback){
		db.get('SELECT username, id FROM users WHERE username = ? AND password = ?', username, hash, function(err, row) {
			callback(err,row);
		});
	},

	getUserById:function(id,callback){
		db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
			callback(err,row);
		});
	},
	addUser:function(username,hash,configSalt,callback){
		db.run("Insert INTO USERS (username,password,salt) VALUES(?,?,?)",username,hash,configSalt,function(err){
			callback(err,1);
		});
	}
};

var dashboardQuery = {
	createDashBoard:function(id,userId,name,seqId,callback){
		db.run("Insert INTO DASHBOARD (id,name,userId,seqId,isExcelUploaded) VALUES(?,?,?,?,?)",id,name,userId,seqId,0,function(err){
			callback(err,1);
		});
	},

	getDashBoadsForUser:function(userId,callback){
		db.all('SELECT id, name,seqId,isExcelUploaded FROM DASHBOARD WHERE userId = ?', userId, function(err, rows) {
			callback(err,rows);
		});
	},

	getDashBoardById:function(dashId,callback){
		db.get('SELECT id, name,seqId,isExcelUploaded FROM DASHBOARD WHERE id = ?', dashId, function(err, row) {
			callback(err,row);
		});
	},

	insertDefaultDashBoard:function(userId,newDashBoardId,callback){
		var name = "First Dashboard";
		var seqId = 1;
		this.createDashBoard(newDashBoardId,userId,name,seqId,callback)
	},

	updateExcelUploaded:function(dashId,callback){
		db.run("UPDATE DASHBOARD SET isExcelUploaded = 1 WHERE id = ?",dashId,function(err){
			callback(err,1);
		});
	}
};

var filesQuery = {
	insertFile:function(fileId,fileName,filePath,ext,fileSize,dashboardId,callback){
		db.run("Insert INTO files (id,fileName,filePath,fileExt,fileSize,dashboardId,isProcessed,isProcessing,isSearchable) VALUES(?,?,?,?,?,?,?,?,?)",fileId,fileName,filePath,ext,fileSize,dashboardId,0,0,0,function(err){
			callback(err,1);
		});
	},

	updateFileProcessing:function(flgProcessing,fileId,callback){
		db.run("UPDATE FILES SET isProcessing = ? WHERE id = ?",flgProcessing,fileId,function(err){
			callback(err,1);
		});
	},

	updateFileProcessed:function(fileId,callback){
		db.run("UPDATE FILES SET isProcessing = 0,isProcessed = 1 WHERE id = ?",fileId,function(err){
			console.log(err);
			callback(err,1);
		});
	},

	isFileProcessed:function(fileId,callback){
		db.get('SELECT id, isProcessed FROM FILES WHERE id = ?', fileId, function(err, row) {
			callback(err,row);
		});
	},

	updateFileSearchable:function(fileId,callback){
		db.run("UPDATE FILES SET isSearchable = 1 WHERE id = ?",fileId,function(err){
			callback(err,1);
		});
	},

	getFilesByDashBoard:function(dashboardId,callback){
		db.all('SELECT id, fileName,filePath,fileExt,fileSize,isProcessed,isProcessing,isSearchable FROM FILES WHERE dashboardId = ?', dashboardId, function(err, rows) {
			callback(err,rows);
		});
	},

	getFileDetailsByFileId:function(fileId,callback){
		db.get('SELECT id, fileName,filePath,fileExt,fileSize,dashboardId,isProcessed,isProcessing,isSearchable FROM FILES WHERE id = ?', fileId, function(err, row) {
			callback(err,row);
		});
	},

	getFilesByUserId:function(userId){
		db.all('SELECT DH.id as dashboardId,DH.name as dashboardName,DH.seqId, FI.id as fileId, fileName,filePath,fileExt,fileSize FROM DASHBOARD DH INNER JOIN FILES FI ON DH.id = FI.dashboardId WHERE DH.userId = ?', userId, function(err, rows) {
			callback(err,rows);
		});
	}
};

var fileHeaderQuery = {
	insertHeaderData:function(headerData,callback){
		db.serialize(function() {
			db.run("begin transaction");
			headerData.forEach(function(headerJson){
				db.run("INSERT INTO fileHeaders(id,header,userName,type,childId,parentId,fileId) VALUES (?,?,?,?,?,?,?)",headerJson.id,headerJson.header,headerJson.userName,headerJson.type,headerJson.childId,headerJson.parentId,headerJson.fileId,function(err){
					console.log(err);
				});
			});
			db.run("end");
			callback();
		});
	},

	getHeaderData:function(fileId,callback){
		db.all('SELECT id,header,userName, type, childId,parentId,fileId FROM fileHeaders WHERE fileId = ?', fileId, function(err, rows) {
			callback(err,rows);
		});
	}
};

function createTableIfNotExist(){
	db.run("CREATE TABLE if not exists users ( id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT,password TEXT,salt TEXT )");
	db.run("CREATE TABLE if not exists dashboard ( id TEXT PRIMARY KEY, name TEXT,userId INTEGER, seqId INTEGER,isExcelUploaded INTEGER)");
	db.run("CREATE TABLE if not exists files ( id TEXT PRIMARY KEY, fileName TEXT,filePath TEXT, fileExt TEXT, fileSize INTEGER,dashboardId TEXT,isProcessed INTEGER,isProcessing INTEGER,isSearchable INTEGER)");
	db.run("CREATE TABLE if not exists fileHeaders ( id TEXT PRIMARY KEY, header TEXT,userName TEXT, type INTEGER, childId TEXT,parentId TEXT,fileId TEXT)");


	/*db.run("DROP TABLE dashboard");
	db.run("DROP TABLE files");
	db.run("DROP TABLE fileHeaders");*/
};


module.exports = {
					userQuery:userQuery,
					dashboardQuery:dashboardQuery,
					filesQuery:filesQuery,
					fileHeaderQuery:fileHeaderQuery
				 };

