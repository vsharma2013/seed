var mongoDB = require('./mongoDB');
var collectionName = require('../../config/config').mongoConfig.userCollectionName;
var uuid = require('node-uuid');
var promise = require('bluebird');
var map = promise.map;

var userDB = {
    getUsersByMutipleUserName:function(userNameArr){
        var doc = { username: userName };
        var usersMap = {};

        return map(userNameArr,function(userName){
                return this.getIdByUserName(username)
                            .then(function(user){
                                usersMap[username] = user;
                                return true;
                            })
            }.bind(this))
            .then(function(){
                return usersMap;
            });
    },

    'getIdByUserName': function (userName) {
        var doc = { username: userName };
        return mongoDB.findOneDocument(doc, collectionName);
    },
    'getUserById': function (id) {
        var doc = { id: id };
        return mongoDB.findOneDocument(doc, collectionName);
    },

    'getSaltByUserName': function (username) {
        var doc = {
            'username': username
        };
        return mongoDB.findOneDocument(doc, collectionName);
    },

    'getUserDetailsByUserNameAndPass': function (userName, pass) {
        var doc = {
            'username': userName,
            'password': pass
        }
        return mongoDB.findOneDocument(doc, collectionName);
    },
    
    'addUserToDB': function (userData) {
        var searchUser = {
            username: userData.username
        };
       return mongoDB.findDocuments(searchUser, collectionName)
            .then(function (row) {
                if (row && row.length != 0) {
                    return false;  //user already exists in DB
                } else {
                    return mongoDB.insertDocuments(collectionName, [userData])
                }
            });
    },
    
    'validateUser': function (username, id) {
        var userDoc = {
            id: id
        };
        return mongoDB.findDocuments(userDoc, collectionName)
            .then(function (row) {
                if (row && row.length != 0 && row[0].username == username) {
                    var updateData = row[0];
                    updateData.validate = true;
                    var criteria = {
                        id: updateData.id
                    };
                    return mongoDB.updateDocuments(criteria, updateData, collectionName)
                        .then(function (row) {
                            if (row) {
                                return (row);
                            }
                        });
                } else {
                    return false;
                }
            });
    }
};

module.exports = userDB;