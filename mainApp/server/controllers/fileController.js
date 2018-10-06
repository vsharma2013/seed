var uploader = require('../fileHandler/fileUploader');
var reader = require('../fileHandler/fileReader');
var dataSetDB = require('../mongoDB/dataSetsDB');
var promise = require('bluebird');
var logger = require('./../utils/Logger');

function handleException(err){
	console.log(err);
	logger.log(err.stack);
}

var fileUploadCtrl = {
	handleDataSetFileUpload:function(req,res){
		var dataSetId = req.params.id;
		var userId = req.user.id;

		uploader.uploadFile(req,req.user.id,dataSetId)
			.then(this.getFileHeaderDetails)
			.then(function(data){
				var headers = data.headers;
				var flgValid = this.validateHeaders(headers);
				data.isValidHeaders = flgValid;
				var response = {
					'status':200,
					'data':data
				};
				if(!flgValid){
					response.error = "File header names cannot contain dots (i.e. .) and must not start with a dollar sign (i.e. $). Please edit the file and upload again.";
				}
				res.json(response);
			}.bind(this))
			.catch(function(error){
				handleException(error);
			});	
	},

	'validateHeaders':function(headers){
		var flgValid = true;
		if(headers && headers.length > 0){
			for(var i=0;i<headers.length;i++){
				var header = headers[i].header;
				if(this.checkStartFromDollarChar(header)){
					flgValid = false;
					break;
				}

				if(this.checkContainDots(header)){
					flgValid = false;
					break;
				}
			}
		}
		return flgValid;
	},

	'checkStartFromDollarChar':function(header){
		if(header && header.charAt(0) == '$'){
			return true;
		}
		return false;
	},

	'checkContainDots':function(header){
		if(header && header.indexOf(".") != -1){
			return true;
		}
		return false;
	},

	getFileHeaderDetails:function(fileDetails){
		var filePath = fileDetails.filePath;
		return new promise(function(resolve,failure){
			reader.readDataFromCSV(filePath,true,function(headerRowMap){
				var headerData = dataSetDB.createDataSetHeaders(fileDetails.id,headerRowMap);
				resolve({fileDetails:fileDetails,headers:headerData});
			});
		});
	},

	handleFileDataSave:function(fileDetails,headers){
		var dataSetJson = fileDetails;
		dataSetJson.headers = headers;

		return new promise(function(resolve,failure){
			dataSetDB.updateDataSet(userId,dataSetJson).then(function(){
				resolve(dataSetJson);
			});
		});
	}
};

module.exports = fileUploadCtrl;