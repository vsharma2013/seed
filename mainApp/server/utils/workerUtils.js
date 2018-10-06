var cp = require("child_process");
var promise = require('bluebird');
var logger = require('./Logger');

function worker(path){
	var self = this;
	this.worker = cp.fork(__dirname + path);
	//process.on("uncaughtException", this.killworker.bind(this));
	//process.on("SIGINT", this.killworker.bind(this));
	//process.on("SIGTERM", this.killworker.bind(this));

	this.worker.on('message', function(res) {
        this.onMessage(res);
    }.bind(this));
}

worker.prototype.killworker = function(){
	if(this.worker){
		try{
			console.log('kill');
			this.worker.kill();
			//process.exit();
		}
		catch(e){
			logger.log('process error');
			logger.log(e);
		}
		finally{
			this.worker = null;
		}
	}
}

worker.prototype.send = function(params){
	this.worker.send(params);
	return new promise(function(resolve){
        this.callback = resolve;
    }.bind(this));
}

worker.prototype.onMessage = function(res){
  	if(!res.success){
        logger.log(res.err);
        return;
    }
	if(this.callback){
		this.callback();
		this.callback = null;
	}
}



module.exports = worker;