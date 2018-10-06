var csv = require('fast-csv');
var fs = require('fs');
var promise = require('bluebird');

var fileReader = {
	readDataFromCSV:function(filePath,onlyHeader,callback,transform){

		//return new promise(function(resolve,failure){
		var stream = fs.createReadStream(filePath);
 		var csvData = [];
		var parserStream = csv.fromStream(stream, {headers : true});
		/*parserStream.transform(function(data){
			console.log('1234');
		     if(transform){
		     	transform(data,next);
		     }
		     else{
		     	console.log('123434343');
		     	//next();
		     }
		 })*/
		parserStream.on("data", function(data){
			 if(transform){
			 	transform(data);
			 }
		     csvData.push(data);
		     if(onlyHeader){
		     	stream.destroy();
		     	onlyHeader = false;
		     	callback(csvData[0]);
		 	 }
		 	 if(csvData.length%10000 == 0){
		 	 	//parserStream.emit('pause');
		 	 	parserStream.pause();
		 	 	callback({
		 	 		data:csvData,
		 	 		callback:function(){
			 	 		csvData = [];
			 	 		parserStream.resume();
			 	 	}
		 	 	});
		 	 }
		}).on('close', function(err) {
			//if(onlyHeader){
			//	callback(csvData);
			//}
        	console.log('Stream has been destroyed and file has been closed');
    	}).on("end", function(){
		 	if(!onlyHeader){
		     	callback({
		     		data:csvData
		     	});
		 	}
	 	});
		//});
	},

	headerToLowerCase:function(data){
		var keys = Object.keys(data);
		var lowerData = {};
		keys.forEach(function(key){
			lowerData[key.toLowerCase()] = data[key];
		});
		return lowerData;
	}
};

module.exports = fileReader;
