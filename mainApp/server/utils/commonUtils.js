var nodemailer = require('nodemailer');
var config = require('./../../config/config');

var commonUtils = {
	getIndexNameForBusinessData:function(fileId){
		return fileId + '_bizdata';
	},

	getIndexNameForSearchData:function(fileId){
		return fileId + '_searchdata';
	},

	getTypeNameForBusinessData:function(fileId,headerId){
		return fileId + '_' + headerId;
	},

	getTypeNameForSearchData:function(fileId){
		return fileId;
	},

	getDomainBizDataTypeName:function(){
		return 'domain';
	},

	getDateDomainDateTypeName:function(){
		return 'date_domain';
	},

	getNumberDomainDateTypeName:function(){
		return 'num_domain';
	},

	sendEmail : function(mailBody){
		//if(config.env === 'dev') return;
		 
		var transporter = nodemailer.createTransport('smtps://geektreeadm@gmail.com:G@@k7ree@smtp.gmail.com');

		var mailOptions = {
			from : 'SEED App <mail@geektree.in>',
			to: 'vishals@geektree.in, prasannad@geektree.in, varuna@geektree.in',
			subject : 'SEED application error',
			text : mailBody
		};

		transporter.sendMail(mailOptions, function(error, info){
			if(error){
		        return console.log(error);
		    }
		});
	}
};

module.exports = commonUtils;