(function(NS,routie){
	var mainCtrl = NS.mainCtrl;

	var appRouter = function(){
		var mainCtrlObj = new mainCtrl();
		
		var routes = {
			'': mainCtrlObj.loadApp.bind(mainCtrlObj),
			'app': mainCtrlObj.loadApp.bind(mainCtrlObj),
			'app/:tabindex':mainCtrlObj.loadApp.bind(mainCtrlObj),
			'app/search/:id':mainCtrlObj.loadSearch.bind(mainCtrlObj),
			'app/:tabindex/:id':mainCtrlObj.loadApp.bind(mainCtrlObj),
			'app/search/:id/:qId':mainCtrlObj.loadSearch.bind(mainCtrlObj),
			'app/search/:id/:qId/:display':mainCtrlObj.loadSearch.bind(mainCtrlObj),
			'app/drill/:id/:qStr/:qObj':mainCtrlObj.loadDrillView.bind(mainCtrlObj)
			//'app/dataset/:crudInd/?:id':dataSetCtrl.handleDataSetCrud.bind(dataSetCtrl)
		};

		this.register = function(){
			routie(routes);
		};

		this.init = function(){
			//routie('app');
		};

		this.route = function(path){
			routie(path);
		};
	};
	NS.appRouter = appRouter;
})(window,routie);