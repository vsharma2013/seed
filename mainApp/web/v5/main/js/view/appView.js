(function(NS,Handlebars){
	var dataSetView = NS.dataSetView;
	var dashboardsView = NS.dashboardsView;
	var dashboardPanelView = NS.dashboardPanelView;
	var serviceRouter = NS.serviceRouter;
	var utils = NS.utils;
	var appView = (function(){
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var tabView = null;
			var tabs = {};

			var privateFn = {
				renderView:function(){
					this.renderDataSetTab();
				},

				renderDataSetTab:function(){
					this.tabViewChange();
					this.activeTab($('.dummyDataSetsTab'));
				},

				renderDashboardsTab:function(){
					this.tabViewChange();
					this.activeTab($('.dummyDashboardTab'));
				},

				renderDashboardPanelTab:function(dashboardId){
					this.tabViewChange();
					this.addDashboardPanelTab(dashboardId);
					this.activeTab($('.'+dashboardId + '_tab'));
				},

				renderSearchPanelTab:function(flgDrill,dataSetId,qId,display){
					this.tabViewChange();
					this.addSearchTab(flgDrill,dataSetId,qId,display);
					this.activeTab($('.dummySearchtab'));
				},

				addDashboardPanelTab:function(id){
					if(!tabs[id]){
						tabs[id] = {tabType: tabTypes.DASHBOARDPANEL};
						var dashboards = viewModel.getDashboards();
						var dashboard = dashboards.getDashboardById(id);
						this.addNewTab(id,dashboard.name);
					}
				},

				deleteDashboardPanelTab:function(id){
					if(tabs[id]){
						$('.'+id + '_tab').remove();
						delete tabs[id];
					}
				},

				addSearchTab:function(flgDrill,id,qId,display){
					var url = '#app/search/'+id + (qId?('/' + qId):'') + (display?('/' + display):'')
					if(flgDrill){
						url = '#app/drill/'+id + (qId?('/' + qId):'')+ (display?('/' + display):'')
					}
					if($('.dummySearchtab').length > 0){
						$('.dummySearchtab').find('a').attr('href',url);
					}
					else{
						var source   = $("#search-tabs-template").html();
						var template = Handlebars.compile(source);
						$('.dummySignOutCont').before(template({id:id,url:url}));
					}
				},

				addNewTab:function(id,name){
					var tabType = tabs[id];
					var source   = $("#tabs-template").html();
					var template = Handlebars.compile(source);
					$('.dummySignOutCont').before(template({id:id,name:name,tabType:tabType.tabType}));
				},

				tabViewChange :function(){
					this.handleLogoutTab();
					if(tabView){
						tabView.destroy();
						tabView = null;
					}
				},

				activeTab:function(activetab){
					$('.dummyTab').removeClass('active');
					activetab.addClass('active');
				},

				handleLogoutTab:function(){
					$(".dummyLogoutButton").off('click').on("click",function(){
				        var box = $($(this).data("box"));
				        if(box.length > 0){
				            box.toggleClass("open");
				        }        
				        return false;
				    });
				    $(".dummyLogoutNoClose").off("click").on("click",function(){
				       $(this).parents(".message-box").removeClass("open");
				       return false;
				    });

				    $(".dummyLogoutYesButton").off("click").on("click",function(){
				    	serviceRouter.logOutApp(function(){
				    		//utils.showAlertMessage('LOGOUT_SUCCESS',function(){
				    		window.location.replace("/login/login.html");
				    		//});
				    	});
				       //$(this).parents(".message-box").removeClass("open");
				       //return false;
				    });    
				}
			};

			this.render = function(){
				privateFn.renderDataSetView();
			}

			this.renderDataSetTab = function(){
				privateFn.renderDataSetTab();
			}

			this.renderDashboardsTab = function(){
				privateFn.renderDashboardsTab();
			}

			this.renderDashboardPanelTab= function(dashboardId){
				privateFn.renderDashboardPanelTab(dashboardId);
			};

			this.renderSearchPanelTab = function(dataSetId,qId,display){
				privateFn.renderSearchPanelTab(false,dataSetId,qId,display);
			};

			this.renderSearchDrillPanelTab = function(dataSetId,qStr,qObj){
				privateFn.renderSearchPanelTab(true,dataSetId,qStr,qObj);
			};

			this.deleteDashboardPanelTab = function(id){
				privateFn.deleteDashboardPanelTab(id);
			}

			this.updateTab = function(data){
				tabView.update(data);
			}
		};
		return view;
	})();

	NS.appView = appView;
})(window,Handlebars);