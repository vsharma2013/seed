var express = require('express');
var app = new express();
var session = require('express-session');
var config = require('./config/config');
var env = config.env;
var auth = require('./server/auth/auth');
var apiRouter = require('./server/routers/ApiRouter');
var logger = require('./server/utils/Logger');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var compression = require('compression');
var cUtils = require('./server/utils/commonUtils');


app.use(compression({threshold:0}));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(busboy());

// required for passport
app.use(session({ 
					secret: 'Yes!Let me be secret',
					resave: false,
  					saveUninitialized: false,
  					cookie: { secure: false } 
})); // session secret
app.use(auth.passport.initialize());
app.use(auth.passport.session()); // persistent login sessions



app.use('/login',express.static(__dirname + '/web/login'));

if(env == "dev"){
	app.use('/v1',express.static(__dirname + '/web/v1'));
	app.use('/app',[apiRouter.isAuthenticated,express.static(__dirname + '/web/v5')]);
	app.use('/app1',[express.static(__dirname + '/web/v3')]);
}
else{
	app.use('/app',[apiRouter.isAuthenticated,express.static(__dirname + '/web/build')]);
}

app.use('/temp',[apiRouter.resAuthenticated,express.static(__dirname + '/web/v5/main/uiTemplates')]);
app.use('/api', apiRouter);



app.get('/',function(req,res){
	res.redirect('/login/login.html');
});

app.use(function(err, req, res, next) {
  logger.log(err.stack);
  cUtils.sendEmail(req.headers.host + req.url + '\n\n\n' + err.message + '\n\n\n' + err.stack);
  res.status(500).json({success:false, data:'internal server error'});
});

app.listen(config.port);
console.log('server running at port - ' + config.port);