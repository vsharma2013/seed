var config = require('./../../config/config');
var moment = require('moment');
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({ filename: config.logger.logDir + 'app-' + moment().format('MM-DD-YYYY') + '.log'})
    ]
  });

process.on("message", function (logParams) {
	if(config.env === 'dev')
		console.log(logParams);
	
    logger.log('info', logParams);
    process.send("done");
});