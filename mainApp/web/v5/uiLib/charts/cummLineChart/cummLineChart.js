(function(NS){
	var cummLineChart = (function(){

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
				nv.addGraph(function() {
				     var chart = nv.models.cumulativeLineChart()
				                  .x(function(d) { return d[0] })
				                  .y(function(d) { return d[1] }) //adjusting, 100% is 1.00, not 100 as it is in the data
				                  .color(d3.scale.category10().range())
				                  .useInteractiveGuideline(true)
				                  ;

				     /*chart.xAxis
				        .tickValues([1078030800000,1122782400000,1167541200000,1251691200000])
				        .tickFormat(function(d) {
				            return d3.time.format('%x')(new Date(d))
				          });*/

				    /*chart.xAxis
				        .tickFormat(d3.format(',f'));

				    chart.yAxis
				        .tickFormat(d3.format(',.1f'));*/

				    d3.select('.'+ defaultOptions.contClass)
				        .datum(model.getData())
				        .call(chart);

				    resizeObj = nv.utils.windowResize(chart.update);

				    chart.lines.dispatch.on('elementClick', function(e) {
				    	console.log(e);
						alert(e.point.label);
					});

				    return chart;
				},function(){
					   d3.selectAll('.'+ defaultOptions.contClass + " .nv-bar").on('click',
			               function(barData){
			               		console.log(barData);
			               		var l = barData.key;
			               		var tKey = barData.x;
			               		 var onChartClick = defaultOptions.onChartClick;
								if(!onChartClick){
									return;
								}
								onChartClick(l,tKey);
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
	NS.cummLineChart = cummLineChart;
})(window);