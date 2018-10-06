(function(NS){
	$(document).ready(function(){
		var routes = new NS.appRouter();
		routes.register();
		routes.init();
	});
})(window);