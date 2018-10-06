(function(NS){
	var simpleLineChart = (function(){

		var chart = function(model,userSettings,userOptions){
			var resizeObj = null;
			var settings = {

			};

			var defaultOptions = {
				contClass:'arc',
				data:{},
				onChartClick:null
			};

			var init = function(){
				createGraph();
			};

			var createGraph = function(){
				var chartData = model.getData();
               if(!chartData || chartData.length == 0){
                       return;
               }
				nv.addGraph(function() {
					var xValsMap = chartData.xVals;
				     var chart = nv.models.lineChart()
				                .margin({left: 30})  //Adjust chart margins to give the x-axis some breathing room.
				                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
				                .options({
				                	transitionDuration: 350,  //how fast do you want the lines to transition?
				                 	noData: "Not enough data to graph"
				                 })
				                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
				                .showYAxis(true)        //Show the y-axis
				                .showXAxis(true)        //Show the x-axis
				  				;

				  chart.xAxis     //Chart x-axis settings
				      .tickFormat(function(d) {
				            return xValsMap[d];
				          });

				  /*chart.xAxis
        				.tickValues(chartData.xVals);*/

				 /* chart.yAxis     //Chart y-axis settings
				      .axisLabel('Voltage (v)')
				      .tickFormat(d3.format('.02f'));*/

				    d3.select('.'+ defaultOptions.contClass)
				        .datum(chartData.data)
				        .call(chart);

				    resizeObj = nv.utils.windowResize(chart.update);

				    chart.lines.dispatch.on('elementClick', function(lineData) {
				    	if(lineData && lineData.length > 0){
				    		var line = lineData[0];
				    		var tKey = xValsMap[line.point.x];
				    		var onChartClick = defaultOptions.onChartClick;
					    	if(!onChartClick){
								return;
							}
							onChartClick(null,tKey);
				    	}
				    	
						//alert(e.point.label);
					});

				    return chart;
				},function(){
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
	NS.simpleLineChart = simpleLineChart;
})(window);