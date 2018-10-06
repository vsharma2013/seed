var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var apiController = require('./../controllers/ApiController');
var dashBoardController = require('./../controllers/dashboardController');
var newDashBoardController = require('./../controllers/newDashboardController');
var fileController = require('./../controllers/fileController');
var fileProcessController = require('./../controllers/fileProcessController');
var auth = require('../auth/auth');
var hierarchyCont = require('./../hierarchy-extractor/hierarchyManager');
var env = require('../../config/config').env;

// As with any middleware it is quintessential to call next()
// if the user is authenticated

var redirectOnAuth = function (req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login/login.html');
}

var isAuthenticated = function (req, res, next) {    
    if (req.isAuthenticated()){
        return next();
    }
    res.json({'success':0,'message':'session expired.','errorType':'1'});
};

//App router with authentication
router.get('/', isAuthenticated,apiController.handleDefaultRequest);
router.get('/search', isAuthenticated,apiController.handleSearchRequest.bind(apiController));
router.post('/search/obj', isAuthenticated,apiController.handleSearchByQueryObj.bind(apiController));
router.post('/searchdisplay/obj', isAuthenticated,apiController.handleDisplaySearchByQueryObj.bind(apiController));

router.get('/ol', isAuthenticated,apiController.handleOutlierRequest.bind(apiController));
router.post('/upload', isAuthenticated,dashBoardController.handleFileUpload.bind(dashBoardController));
router.post('/process', isAuthenticated,dashBoardController.handleDataIndexing.bind(dashBoardController));
router.get('/addDefDash', isAuthenticated,dashBoardController.insertDefaultDashboard.bind(dashBoardController));
router.get('/dash', isAuthenticated,dashBoardController.getAllDashBoardDataForUser.bind(dashBoardController));
router.post('/file/pro', isAuthenticated,dashBoardController.isFileProcessed.bind(dashBoardController));

//App router for save and build index
router.post('/strategy/save',isAuthenticated, apiController.handleSaveSalesStrategyRequest.bind(this));
router.get('/strategy/build',isAuthenticated,apiController.handleBuildSalesIndicesRequest.bind(this));

router.get('/searchdisplay',isAuthenticated,apiController.handleDisplaySearchRequest.bind(apiController));



//****** Dashboard ApIs Start ******
router.get('/_reset',newDashBoardController.resetAllData.bind(newDashBoardController));

router.get('/_userdata',isAuthenticated,newDashBoardController.getAllDataForUser.bind(newDashBoardController));

//Dataset crud APIs
router.post('/_ds/:id',isAuthenticated,newDashBoardController.addNewDataSet.bind(newDashBoardController));
router.put('/_ds/:id',isAuthenticated,newDashBoardController.updateNewDataSet.bind(newDashBoardController));
router.delete('/_ds/:id',isAuthenticated,newDashBoardController.deleteDataSet.bind(newDashBoardController));

router.get('/_ds/_hier/:id',isAuthenticated,newDashBoardController.getHierarchyForDataSet.bind(newDashBoardController));
router.put('/_ds/_hier/:id',isAuthenticated,newDashBoardController.saveHierarchyForDataSet.bind(newDashBoardController));
//Dataset upload API
router.post('/_ds/_upload/:id',isAuthenticated,fileController.handleDataSetFileUpload.bind(fileController));

//Process Dataset
router.post('/_ds/_process/:id',isAuthenticated,fileProcessController.processDataSet.bind(fileProcessController));
router.get('/_ds/_state/:id',isAuthenticated,fileProcessController.getFileState.bind(fileProcessController));

//Dashboard crud APIs
router.post('/_dash/:id',isAuthenticated,newDashBoardController.addNewDashboard.bind(newDashBoardController));
router.put('/_dash/:id',isAuthenticated,newDashBoardController.updateDashboard.bind(newDashBoardController));
router.delete('/_dash/:id',isAuthenticated,newDashBoardController.deleteDashboard.bind(newDashBoardController));

//DashboardShareApis
router.post('/_dash/_share/_val',isAuthenticated,newDashBoardController.validateUsers.bind(newDashBoardController));
router.get('/_dash/_share',isAuthenticated,newDashBoardController.getAllShareDashboards.bind(newDashBoardController));

//Queries crud APIs
router.get('/_query',isAuthenticated,newDashBoardController.getAllQueriesForUser.bind(newDashBoardController));
router.post('/_query/:id',isAuthenticated,newDashBoardController.addNewQuery.bind(newDashBoardController));



//****** Dashboard ApIs End ******

function isAuthenticated2(req, res, next){
    return next();
}

router.get('/qmeta/:fileId', isAuthenticated, apiController.handleQueryMetaRequest.bind(apiController));
router.get('/qs/:fileId/:q', isAuthenticated, apiController.handleQuerySuggestionRequest.bind(apiController));

router.get('/logout',isAuthenticated,function(req,res){
  req.session.destroy(function (err) {
     res.json({'status':200, 'data':{'message':'App logout Successfully.','errorType':'1'}});
  });
});

//Login Router
router.post('/login', auth.passport.authenticate('local-login', {
    successRedirect: '/app/index.html',
    failureRedirect: '/login/login.html'
}));

//Router for inserting User
router.post('/admin/user',function(req,res){
    var token = req.body.token;
    var fullName = req.body.fullName;
    var companyName = req.body.companyName;
    var username = req.body.username;
    var pass = req.body.password;
  
    var data = username + ' ' + pass + ' ' + fullName; // + ' ' + companyName;
    var hash =  crypto.createHash('md5');
    var md5 = hash.update(data).digest('hex');
    
    var keys = md5 + ' 45.33.98.20' + ' 139.162.37.189' + ' GeekTree Technologies';
    //var keys = md5 + ' 192.168.1.112' + ' 192.168.1.112' + ' GeekTree Technologies';    
    var local_hash = crypto.createHash('md5');
    var local_md5 = local_hash.update(keys).digest('hex');
    
    var response = {
        status: 200,
        success: 'damn it',
        result : {
            id : 0           
        }
    };
    
    if(token != local_md5) {
        response.success = 'invalid_data';        
        res.json(response);
    } else {
        auth.addUser(fullName, companyName, username, pass, function (err, sucess) {
            if (err && err.insertedCount == 1) {
                response.success = 'user_added';
                response.result.id = err.ops[0].id;
            } else {
                response.success = 'user_exists';
            }
            res.json(response);
        });    
    }    
});

if(env == "dev"){
    router.post('/admin/dummyuser',function(req,res){
        var fullName = req.body.fullName;
        var companyName = req.body.comapanyName;
        var username = req.body.username;
        var pass = req.body.password;
        auth.addUser(fullName, companyName, username, pass, function (row) {
            var response = {};
            if (row && row.insertedCount == 1) {
                response.success = 'user_added';
                response.result.id = err.ops[0].id;
            } else {
                response.success = 'user_exists';
            }
            res.end(JSON.stringify(response));
        },true); 
    });
}

router.get('/admin/validate', function (req, res) {
    var token = req.query.key;
    var username = req.query.user;

    auth.validateUser(username, token, function (err, params){
        var response = {
            status: 200,
            success: 'Updated Successfully'
        };
        if (err && err.result.nModified == 1) {            
            response.success = 'user_valid';
            res.redirect('/login/login.html');
        } else {
            response.success = 'user_invalid';
        }
        
        res.end(JSON.stringify(response));
    });    
});

router.isAuthenticated = redirectOnAuth;
router.resAuthenticated = isAuthenticated;

module.exports = router;