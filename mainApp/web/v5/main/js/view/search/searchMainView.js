(function(NS,routie){
	var widget = NS.widget;
	var ResponseParser = NS.ResponseParser;
	var searchDisplayView = NS.searchDisplayView;
	var utils = NS.utils;
	var querySuggester = NS.querySuggestor;

	var searchMainView = (function(){
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var container = $('.mainContainer');
			var responseParserObj = new ResponseParser();
			var defBarViewId = 2;
			var searchDisplayViewObj = null;
			var widgetViews = {};
			
			
			var privateFn = {
				renderView:function(){
					this.getTemplate();
				},
				getTemplate:function(){
					utils.getHBUITemplate('searchTmpl.hbs',this.addTemplateToUI.bind(this))
				},

				addTemplateToUI:function(hbTemplate){
					var queries = viewOptions.queries;
					container.html(hbTemplate({dataset:viewModel,queries:queries.getQueriesByDataSetId(viewModel.id)}));
					this.bindUIEvents();
					this.handleSearchQuery();
					querySuggester.init(viewModel.id, this.getViewOptionsForQuerySuggester());
				},

				handleSearchQuery:function(){
					var qId = viewOptions.queryId;
					var display = viewOptions.currDisplay;
					if(qId){
						viewOptions.onSearch(qId,display);
					}
				},

				bindUIEvents:function(){
					$('.dummySearchButtonCtrl').unbind('click').bind('click',this.onSearchButtonClick.bind(this));
					$('.dummySearchTextCtrl').unbind('keydown').bind('keydown',this.onSearchTextQuery.bind(this));
					$('.content-queries-left-toggle').unbind('click').bind('click',this.onQueriesToggleClick.bind(this));
				},

				onQueriesToggleClick:function(){
					 $(".content-queries-left").is(":visible") 
					        ? $(".content-queries-left").hide() 
					        : $(".content-queries-left").show();
				},

				onSearchButtonClick:function(){
					var queryText = $('.dummySearchTextCtrl').val();
					if(queryText && queryText != ''){
						viewOptions.handleTextQuery(viewModel,queryText);
					}
				},

				onSearchTextQuery:function(e){
					querySuggester.handleKeyPress(e);
					if(e.keyCode !== 13) return;
					this.onSearchButtonClick();
				},

				search:function(queryId,display,results){
					this.resetOldSearch();
					var queries = viewOptions.queries;
					var displays = this.getAllDisplayTypes(results);
					var defDisplay = display?display:this.getDefaultDisplayType(results);

					defDisplay = (defDisplay && displays.indexOf(defDisplay) != -1)?defDisplay:displays[0];
					this.renderDisplaysUI(queryId,displays,defDisplay);
					this.renderChartsForDisplay(queryId,defDisplay,results);
				},

				getDefaultDisplayType:function(results){
					var defDisplay = responseParserObj.getDefaultDisplayType(results);
					return defDisplay;
				},

				resetOldSearch:function(){
					$('.dummySearchPieCont').empty();
					$('.dummySearchTimelineCont').empty();
					//$('.dummySearchTextCtrl').val('');
				},

				renderDisplaysUI:function(queryId,displays,currDisplay){
					if(searchDisplayViewObj){
						searchDisplayViewObj.destroy();
						searchDisplayViewObj = null;
					}
					searchDisplayViewObj = new searchDisplayView(displays,{
						'contClass':'dummySearchDisplayCont',
						'display':currDisplay,
						'qId':queryId,
						'dataId':viewModel.id
					});
					searchDisplayViewObj.render();
				},

				getAllDisplayTypes:function(results){
					return responseParserObj.getAllDisplayTypes(results)
				},

				onPinClick:function(panelModel){
					var panelObj = JSON.parse(JSON.stringify(panelModel));
					viewOptions.onPinChart(panelObj);
				},

				renderChartsForDisplay:function(queryId,display,results){
					this.disposeWidgetView();
					var queries = viewOptions.queries;
					var query = queries.getQueriesById(queryId);
					$('.dummySearchTextCtrl').val(query.queryStr);
					var timeField = responseParserObj.getTimeField(results);
					this.renderPieChart(results,query,display);
					this.renderTimelineChart(results,query,display,timeField);
					this.showMessageForSearchedAndErrorKeys();
				},

				renderPieChart:function(results,query,display){
					var userModel = viewOptions.userModel;
					var panel = JSON.parse(JSON.stringify(query));
					var panelModel = this.createPanelForPieChart(panel,display);
					var widgetOptions = {};
					widgetOptions['contClass'] = 'dummySearchPieCont';
					widgetOptions['height'] = panelModel.chartSettings.h;
					widgetOptions['panel'] = panelModel;
					widgetOptions['data'] = results;
					widgetOptions['title'] = panelModel.title;
					widgetOptions['description'] = panelModel.description;
					widgetOptions.onChartChange = function(chartType){
						userModel.setContainerChartType(chartType);
					}
					widgetOptions.onPinClick = function(){
						this.onPinClick(panelModel);
					}.bind(this);

					var panelView = new widget(widgetOptions);
					panelView.render();
					widgetViews['pie'] = panelView;
				},

				renderTimelineChart:function(results,query,display,timeField){
					if(!timeField){
						return;
					}
					var isCompare = responseParserObj.isCompareResponse(results);
					var panel = JSON.parse(JSON.stringify(query));
					var panelModel = this.createPanelForTimeLine(panel,display,timeField,isCompare);
					var widgetOptions = {};
					widgetOptions['contClass'] = 'dummySearchTimelineCont';
					widgetOptions['height'] = panelModel.chartSettings.h;
					widgetOptions['panel'] = panelModel;
					widgetOptions['data'] = results;
					widgetOptions['title'] = panelModel.title;
					widgetOptions['description'] = panelModel.description;
					widgetOptions.onChartChange = function(chartType){
						if(isCompare){
							userModel.setCompareTimelineChartType(chartType);
						}
						else{
							userModel.setTimelineChartType(chartType);
						}
					}
					widgetOptions.onPinClick = function(){
						this.onPinClick(panelModel);
					}.bind(this);
					widgetOptions.onOutlierClick = this.onOutlierClick.bind(this, panelModel);
					var panelView = new widget(widgetOptions);
					panelView.render();
					widgetViews['timeline'] = panelView;
				},

				createPanelForPieChart:function(panel,display){
					var userModel = viewOptions.userModel;

					panel.chartType = userModel.getContainerChartType();
					panel.display = display;
					panel.timeField = '';
					panel.title = panel.queryStr;
					panel.description = 'Distribution for the ' + display;
					panel.chartSettings = this.createPieChartSettings();
					panel.query = panel.query;
					return panel;
				},

				createPieChartSettings:function(){
					var height = 300;
					var chartSettings = {};
					chartSettings['h'] = height;
					chartSettings['w']=$('.dummySearchPieCont').width();
					return chartSettings;
				},

				createPanelForTimeLine:function(panel,display,timeField,isCompare){
					var userModel = viewOptions.userModel;

					panel.chartType = isCompare?userModel.getCompareTimelineChartType():userModel.getTimelineChartType();
					panel.display = display;
					panel.timeField = timeField;
					panel.title = panel.queryStr;
					panel.description = 'Distribution by '+ timeField +' for the ' + display;
					panel.chartSettings = this.createTimelineChartSettings();
					panel.query = panel.query;
					panel.isCompare = isCompare;
					return panel;
				},

				createTimelineChartSettings:function(){
					var height = 300;
					var chartSettings = {};
					chartSettings['gtype'] = defBarViewId;
					chartSettings['h'] = height;
					chartSettings['w']=$('.dummySearchTimelineCont').width();
					return chartSettings;
				},

				showMessageForSearchedAndErrorKeys:function(){
					var errorKeys = [];
					var searchedQuery = '';
					var totalRecords = 0;
					if(widgetViews){
						for(var key in widgetViews){
							var widgetView = widgetViews[key];
							searchedQuery = widgetView.getQueryStrForPanel();
							totalRecords = widgetView.getQueryPanelRecordsCount();
							errorKeys = errorKeys.concat(widgetView.getErrorKeys())
						};
					}

					$('.dummySearchResultsText').html('Search Results for Query "<strong>'+searchedQuery+'</strong>" ('+totalRecords+' results)')

					if(errorKeys && errorKeys.length > 0){
						var uniqueErrorKeys = {};
						errorKeys.forEach(function(errorKey){
							uniqueErrorKeys[errorKey] = 1;
						});
						var keys = Object.keys(uniqueErrorKeys).join(',');
						$('.dummySearchErrorText').html('Keyswords "<strong>'+keys+'</strong>" are not recoganized');
						//utils.showMessage('SEARCH_ERROR_KEYWORDS',keys);
					}
				},

				onOutlierClick : function(panelModel, e){
					e.preventDefault();
					var widgetView = widgetViews['timeline'];
					if(widgetView){
						panelModel.chartType = 2;
						viewOptions.handleOutlierQuery(panelModel, widgetView);
					}
				},

				disposeWidgetView:function(){
					if(widgetViews){
						for(var key in widgetViews){
							var widgetView = widgetViews[key];
							widgetView.destroy();
						}
					}
				},

				getViewOptionsForQuerySuggester : function(){
					var options = {
						getCurrentDisplay : function(){ return viewOptions.currDisplay ;}
					};
					return options;
				}
			}

			this.render = function(){
				privateFn.renderView();
			};

			this.search = function(id,display,results){
				privateFn.search(id,display,results);
			};

			this.destroy = function(){
				viewModel = null;
				container.empty();
			};
		};
		return view;
	})();

	NS.searchMainView = searchMainView;
})(window,routie);