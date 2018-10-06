var conf = require('../../config/config');
var mkdirp = require("mkdirp")
var path = require("path");
var uuid = require('node-uuid');
var fs = require('fs');
var promise = require('bluebird');
var cUtils = require('./../utils/commonUtils');



var uploadFile = function(req,userId,dataSetId){
    var fstream;
    return new promise(function(resolve,failure){
        req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            console.log("Uploading: " + filename);
            
            createFileDetails(dataSetId,userId,filename,function(fileDetails){
                //Path where image will be uploaded
                fstream = fs.createWriteStream(fileDetails.filePath);
                file.pipe(fstream);
                fstream.on('close', function () {    
                    console.log("Upload Finished of " + filename);    
                    cUtils.sendEmail('Following file was upoaded : \n' + fileDetails.filePath);          
                    resolve(fileDetails);           //where to go next
                });
            });
        });
       
        req.pipe(req.busboy);
    });
};

var getUploadFilePath = function(userId,callback){
    var baseUploadFolder = conf.uploadFolder;
    var userId = userId;
    var userPath = baseUploadFolder + '/' + userId;
    mkdirp(userPath, function (err) {
        if (err) console.error(err)
        callback(userPath)
    });
    //return baseUploadFolder + '/' + userId;
};

var getFileId = function(){
    return uuid.v4();
};

var createFileDetails = function(fileId,userId,filename,callback){
    var fileExt = path.extname(filename);
    getUploadFilePath(userId,function(uploadFilePath){
        var completeFilePath = uploadFilePath + '/' + fileId + fileExt;
        callback({id:fileId,fileName:filename,fileExt:fileExt,filePath:completeFilePath});
    });
};

module.exports = {uploadFile: uploadFile};



