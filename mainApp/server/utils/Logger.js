var cp = require("child_process");

function Logger(){
	this.loggerWorker = cp.fork(__dirname + "/LoggerWorker");
	//process.on("uncaughtException", this.killworker.bind(this));
	//process.on("SIGINT", this.killworker.bind(this));
	//process.on("SIGTERM", this.killworker.bind(this));
}

Logger.prototype.killworker = function(){
	if(this.loggerWorker){
		try{
			console.log('kill');
			this.loggerWorker.kill();
			//process.exit();
		}
		catch(e){
			console.log('process error');
		}
		finally{
			this.loggerWorker = null;
		}
	}
}

Logger.prototype.log = function(params){
	this.loggerWorker.send(params);
}

var gLogger = new Logger();

module.exports = gLogger;