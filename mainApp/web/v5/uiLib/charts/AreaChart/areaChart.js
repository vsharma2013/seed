(function(NS){
	var areaChart = (function(){

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
			 	if(!model){
                     return;
                }
                var chartData = model.getData();
                if(!chartData || chartData.length == 0){
                       return;
                }
				nv.addGraph(function() {
					var xValsMap = chartData.xVals;
				    var chart = nv.models.stackedAreaChart()
				                  .margin({right: 100})
				                  .x(function(d) { return d[0] })   //We can modify the data accessor functions...
				                  .y(function(d) { return d[1] })   //...in case your data is formatted differently.
				                  //.useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
				                  .rightAlignYAxis(true)      //Let's move the y-axis to the right side.
				                  .options({
								        transitionDuration: 300,    // This should be duration: 300
								        useInteractiveGuideline: true
								    })
				                  .showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
				                  .clipEdge(true);

				    chart.xAxis     //Chart x-axis settings
				      .tickFormat(function(d) {
				            return xValsMap[d];
				          });
				    d3.select('.'+ defaultOptions.contClass)
				        .datum(chartData.data)
				        .call(chart);

				    resizeObj  = nv.utils.windowResize(chart.update);
				    

				    /*d3.dispatch.on('elementClick',function(e){
				    	console.log('element: ' + e.value);
    					console.dir(e.point);
				    });

				     chart.stacked.scatter.dispatch.on('elementClick',function(e){
				    	console.log('element: ' + e.value);
    					console.dir(e.point);
				    })*/
				    return chart;
				},function(){
			          d3.selectAll('.'+ defaultOptions.contClass + " .nv-area").on('click',
			               function(areaData){
			               		
			               		var l = areaData.key;
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
				resizeObj = null;
			}

		}

		return chart;
	})();
	NS.areaChart = areaChart;
})(window);