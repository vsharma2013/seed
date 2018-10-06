(function(NS){
	var barChartNew = (function(){

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
				var data = model.getData();
               if(!data || data.length == 0){
                       return;
               }
				nv.addGraph(function() {
				    var chart = nv.models.multiBarChart()
				    	.stacked(true)
				      .options({
					        transitionDuration: 300
					    })
				      .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
				      .rotateLabels(0)      //Angle to rotate x-axis labels.
				      .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
				      .groupSpacing(0.2)    //Distance between each group of bars.
				    ;

				    /*chart.xAxis
				        .tickFormat(d3.format(',f'));

				    chart.yAxis
				        .tickFormat(d3.format(',.1f'));*/

				    d3.select('.'+ defaultOptions.contClass)
				        .datum(data)
				        .call(chart);

				   
				    resizeObj = nv.utils.windowResize(chart.update);

				    chart.multibar.dispatch.on('elementClick', function(chart,e){
				    	bindClickEvent(e);
					}.bind(this,chart));
				    return chart;
				},function(){
					  //bindClickEvent();
					  /*d3.selectAll('.'+ defaultOptions.contClass + ' .nv-series').on('click',function(){
					  	 bindClickEvent();
					  });*/

				});
			};

			var bindClickEvent = function(barData){
 				var data = barData.data;

           		var l = data.key;
           		var tKey = data.x;
           		 var onChartClick = defaultOptions.onChartClick;
				if(!onChartClick){
					return;
				}
				onChartClick(l,tKey);
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
	NS.barChartNew = barChartNew;
})(window);