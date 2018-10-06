(function(NS){
	var descreteBarChart = (function(){

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
                if(!data){
                      return;
                }
				nv.addGraph(function() {
				   var chart = nv.models.discreteBarChart()
				      .x(function(d) { return d.label })    //Specify the data accessors.
				      .y(function(d) { return d.value })
				      .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
				      .options({
	                       'transitionDuration':350
                       })
				      //.tooltips(false)        //Don't show tooltips
				      .showValues(true)       //...instead, show the bar value right on top of each bar.
				      //.transitionDuration(350)
				      ;

				    d3.select('.'+ defaultOptions.contClass)
				        .datum(data)
				        .call(chart);

				     d3.select('.'+ defaultOptions.contClass).select('.nv-x')
                                               .selectAll('.tick text')
                               .attr('transform', 'rotate(-45,0,0)')
                              .style('text-anchor','end');

                              
                    d3.select('.'+ defaultOptions.contClass).select('.nv-barsWrap')
                                           .selectAll('.nv-bar text')
                           .attr('transform', 'rotate(90,0,0)')
                           .style('text-anchor','start');

				    resizeObj = nv.utils.windowResize(function(){
				    	chart.update();
				    	 d3.select('.'+ defaultOptions.contClass).select('.nv-x')
                                               .selectAll('.tick text')
                               .attr('transform', 'rotate(-45,0,0)')
                              .style('text-anchor','end');

                              
                    	d3.select('.'+ defaultOptions.contClass).select('.nv-barsWrap')
                                           .selectAll('.nv-bar text')
                           .attr('transform', 'rotate(90,0,0)')
                           .style('text-anchor','start');
				    });

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
	NS.descreteBarChart = descreteBarChart;
})(window);