var promise = require('bluebird');
var mongodb = require('mongodb');
var MongoClient = promise.promisifyAll(mongodb).MongoClient;
var mongoConfig = require('../../config/config').mongoConfig;

var using = promise.using;
var dbConnection = null;

var mongoDB = {
	'connect':function(){
		 // Use connect method to connect to the Server
		 //console.log('connection open');
		return new promise(function(resolve){
			if(dbConnection){
				resolve(dbConnection);
			}
			else{
				//console.log('connection open');
				MongoClient.connectAsync(mongoConfig.projectUrl)
					.then(function(db){
						dbConnection = db;
						resolve(dbConnection);
					},function(err){
						throw err;
					}).
					catch(function(err){
						throw err;
					});
			}
		});

		/*MongoClient.connectAsync(mongoConfig.projectUrl)
					.disposer(function(connection){
						//console.log('close connection')
					            connection.close();
					        });*/
	},

	'updateDocuments':function(criteria,updateDoc,collectionName){
		delete updateDoc._id;
		return using(this.connect(),
			function(db){
				var collection = db.collection(collectionName);
				return collection.updateAsync(criteria, updateDoc);
			}
		);
	},

	'findDocuments':function(findData,collectionName){
		return using(this.connect(),
					function(db){
						var collection = db.collection(collectionName);
						return collection.findAsync(findData)
								.then(function(data){
									return data.toArrayAsync();
								});
					} 
			);
	},

	findPartialDocuments:function(findData,startInd,pageSize,collectionName){
		return this.connect()
				.then(function(db){
					var collection = db.collection(collectionName);
					return collection.findAsync({},{ '_id': 0})
				})
				.then(function(data){
					console.log(2);
					return data.skip(startInd).limit(pageSize).toArrayAsync();
				})
				/*.then(function(data){
					console.log(2);
					return data.limitAsync(pageSize);
				})
				.then(function(data){
					console.log(3);
					return data.toArrayAsync();
				});*/
	},

	'findOneDocument':function(findData,collectionName,callback){
		return using(this.connect(),
					function(db){
						var collection = db.collection(collectionName);
						return collection.findOneAsync(findData);
					} 
			);
	},

	'insertDocuments':function(collectionName,docsArr,callback){
		return using(this.connect(),
					function(db){
						var collection = db.collection(collectionName);
						return collection.insertManyAsync(docsArr);
					} 
			);
	},

	'deleteDocument':function(collectionName,doc,callback){
		return using(this.connect(),
					function(db){
						var collection = db.collection(collectionName);
						return collection.deleteOneAsync(doc);
					} 
			);
	},

	'removeAllDocuments':function(collectionName){
		return using(this.connect(),
					function(db){
						var collection = db.collection(collectionName);
						return collection.removeAsync();
					} 
			);
	},

	allDocumentCount:function(collectionName){
		return this.connect()
					.then(function(db){
						var collection = db.collection(collectionName);
						return collection.countAsync();
					});
	},

	getDocumentCountByQuery:function(collectionName,query){
		return this.connect()
				.then(function(db){
					var collection = db.collection(collectionName);
					return collection.findAsync(query)
				})
				.then(function(data){
					return data.countAsync();
				});
	},

	deleteCollection:function(collectionName){
		return this.connect()
					.then(function(db){
						var collection = db.collection(collectionName);
						return collection.dropAsync();
					})
	}
};

module.exports = mongoDB;