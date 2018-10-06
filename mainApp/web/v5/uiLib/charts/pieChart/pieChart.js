(function(NS){
	var pieChart = (function(){

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
					var chart = nv.models.pieChart()
					      .x(function(d) { return d.label })
					      .y(function(d) { return d.value })
					      .showLabels(true);

					    d3.select('.'+ defaultOptions.contClass)
				        	.datum(data)
					        .transition().duration(350)
					        .call(chart);

					    resizeObj = nv.utils.windowResize(chart.update);

					  return chart;
				},function(){
			          d3.selectAll('.'+ defaultOptions.contClass + " .nv-slice").on('click',
			               function(chartData){
			               		var data = chartData.data;
			               		var l = data.label;
			               		 var onChartClick = defaultOptions.onChartClick;
								if(!onChartClick){
									return;
								}
								if(l !== 'Others'){
									onChartClick(l);
								}
								else{
									showToolTip(data.keys,d3.event);
								}
				           });
			      });
			};

			function showToolTip(keys,e){
				if(keys && keys.length >0 ){
					var $tt = $('<div id="othersTooltip">');
					keys.forEach((function(key){
						var $a = $('<a class="others-item">');
						$a.html(key);
						$a.appendTo($tt);
					}).bind(this));
					var x = e.clientX + 10;
					var y = e.clientY - 10;
					$tt.css('left',x + 'px');
					$tt.css('top',y + 'px');
					$tt.appendTo($('body'));
					e.preventDefault();
					e.stopPropagation();

					$('body').unbind('click').bind('click',function(){
						$tt.remove();
						$(this).unbind('click');
					});
					
					$('.others-item').on('click', function(e){
						$('#othersTooltip').remove();
						$('body').unbind('click')
						var onChartClick = defaultOptions.onChartClick;
						if(!onChartClick){
							return;
						}
						onChartClick($(this).html());
					});
				}
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
	NS.pieChart = pieChart;
})(window);