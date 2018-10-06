var extractHierarchy = require('./hierarchy-extract');
var mongoDB = require('../mongoDB/hierarchyDB');
var promise = require('bluebird');

var hierarchyCont = {
	getHierarchy:function(dataSet){
		var hc = new extractHierarchy({
			'fileId':dataSet.id,
			'headerData':dataSet.headers
		});

		var hierarchy = {};
		return hc.getHierarchy()
				.then(function(finalHierarchy){
					hierarchy = finalHierarchy;
					finalHierarchy.createdDate = Date.now();
					return mongoDB.insertHierarchyDocs([finalHierarchy]);
				})
				.then(function(results){
					console.log('hierarchy created successfully');
					hc.dispose();
					hc = null;
					return hierarchy;
				});
	}
}

process.on("message", function (message) {
	hierarchyCont.getHierarchy(message.fileId)
				.then(function(){
			        process.send({
			    		'success':true,
			    		'err':null
			    	});
			    }).
			    catch(function(err){
			    	process.send({
			    		'success':false,
			    		'err':err
			    	});
			    });
});

module.exports = hierarchyCont;