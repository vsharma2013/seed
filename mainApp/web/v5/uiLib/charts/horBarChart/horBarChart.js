(function(NS){
	var horBarChart = (function(){

		var chart = function(model,userSettings,userOptions){
			var resizeObj = null;
			var settings = {

			};

			var defaultOptions = {
				contClass:'arc',
				onChartClick:null
			};

			var init = function(){
				createGraph();
			};

			var createGraph = function(){
				var data = model.getData();
				if(!data || data.length == 0){
				    return;
				}
				nv.addGraph(function() {
				    var chart = nv.models.multiBarHorizontalChart()
					        .x(function(d) { return d.label })
					        .y(function(d) { return d.value })
					        .margin({top: 0, right: 0, bottom: 20, left: 90})
					        .showValues(true)           //Show bar value next to each bar.
					        //.tooltips(true)             //Show tooltips on hover.
					        //.transitionDuration(350)
					        .showControls(false);        //Allow user to switch between "Grouped" and "Stacked" mode.

				    //chart.yAxis
				      //  .tickFormat(d3.format(',.2f'));

				    d3.select('.'+ defaultOptions.contClass)
				        .datum(data)
				        .call(chart);

				    resizeObj = nv.utils.windowResize(chart.update);

				    return chart;
				},function(){
			          d3.selectAll('.'+ defaultOptions.contClass + " .nv-bar").on('click',
			               function(barData){
			               		var l = barData.label;
			               		 var onChartClick = defaultOptions.onChartClick;
								if(!onChartClick){
									return;
								}
								onChartClick(l);
				           });
			      });
			};

			var updateDefultSettings =function(userSettigs){
				if(userSettigs){
					for(var set in userSettigs){
						settings[set] = userSettigs[set];
					}
				}
			};

			var updateDefaultOptions = function(userOptions){
				for(var opt in userOptions){
					defaultOptions[opt] = userOptions[opt];
				}
			};

			this.init = function(){
				updateDefultSettings(userSettings);
				updateDefaultOptions(userOptions);
				init();
			}

			this.destroy = function(){
				model = null;
				if(resizeObj){
					resizeObj.clear();
				}
			}

		}

		return chart;
	})();
	NS.horBarChart = horBarChart;
})(window);