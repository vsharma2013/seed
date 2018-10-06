var crypto = require('crypto');
var logger = require('./../utils/Logger');
var uuid = require('node-uuid');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var dbQuery = require('../mongoDB/userDB');

var configSalt = "MyLatestScreenShot";
passport.use('local-login', new LocalStrategy({
	usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
},function(req,username, password, done) {	
	dbQuery.getSaltByUserName(username).then(function(row){
		if(!row) return done(null,false);
		var hash = hashPassword(password, row.salt);
		dbQuery.getUserDetailsByUserNameAndPass(username, hash).then(function(row){
			if (!row){
				logger.log('Login attempt failed by user: ' + username);
				return done(null, false);
			} else {
                if (row.validate == true){
                    logger.log('Logged in by user: ' + username);
                    return done(null, row);    
                } else {
                    logger.log('Validate your credentials with link in eMail first for user: ' + username);
                    return done(null, false);
                }                    
            }			
		})
		.catch(function(error){
			logger.log(JSON.stringify(error));
			return done(null, false);
		});
	});
}))	;

passport.serializeUser(function(user, done) {
  return done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  dbQuery.getUserById(id).then(function(row) {
    if (!row) return done(null, false);
    return done(null, row);
  })
  .catch(function(err){
  	 logger.log(JSON.stringify(err));
  	 done(null, false);
  });
});

function hashPassword(password, salt) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  hash.update(salt);
  return hash.digest('hex');
};

var auth = {};
auth.passport = passport;

auth.addUser = function(fullName,companyName,username,password,callback,flgvalidate){
	var hash = hashPassword(password,configSalt);
    var userData = {
        id: uuid(),
        fullName: fullName,
        companyName: companyName,
        username: username,
        password: hash,
        salt: configSalt,
        validate: false
    };

    if(flgvalidate){
      userData.validate = true;
    }

    dbQuery.addUserToDB(userData)
        .then(function (row) {
            callback(row);
        })
        .catch(function (error) {
            logger.log(JSON.stringify(error));
            callback(error);
        });
}

auth.validateUser = function (username, id, callback) {
    dbQuery.validateUser(username, id)
        .then(callback)
        .catch(function (error) {
            logger.log(JSON.stringify(error));
            callback(error);
        });
}

module.exports = auth;