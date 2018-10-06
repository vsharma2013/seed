(function(NS){
	
	var barChart = (function(){
		var gTypes = {
			'STACKED':1,
			'GROUPED':2
		};

		var groups = {
			axes : 'st-axis',
			times : 'st-time',
			backnext : 'st-backnext'
		};

		var chart = function(userSettings,userOptions){
			var resizeObj = null;
			var settings = {
				'h':200,
				'w':700,
				gtype:1
			}

			var defaultOptions = {
				contClass:'arc',
				data:{},
				xAxisData:{
					'xStart':0,
					'yStart':0,
					'xEnd':300,
					'yEnd':0,
					'labels':[]
				},
				yAxisData:{
					'xStart':0,
					'yStart':0,
					'xEnd':0,
					'yEnd':-200,
					'labels':[],
					'context':'sales'
				},
				barGroups:[
				],
				onChartClick:null
			};

			

			var currTimeModelIndex = 0;

			var privateFn = {
				init:function(){
					this.addAxes();
					resizeObj = nv.utils.windowResize(this.update.bind(this));
				},

				update :function(){
					var contClass = defaultOptions.contClass;
					var svg  = d3.select('.' + contClass);
					var height = svg.style('height');
					var width = svg.style('width');
					height = parseInt(height.replace("px",''));
					width = parseInt(width.replace("px",''));
					settings.h = height;
					settings.w = width;

					//defaultOptions.xAxisData.xEnd = width;
					//defaultOptions.yAxisData.yEnd = -height;

					svg.selectAll("*").remove();
					this.addAxes();
				},

				getGroupById:function(clsName){
					var contClass = defaultOptions.contClass;
					var g = d3.select('.'+contClass).select('.' + clsName);
					var originX = 60;
					var originY = settings.h - 50;
					if(g.empty()){
						g = d3.select('.'+contClass)
					          .append('g')
						      .attr('transform', 'translate('+originX+','+originY+') scale(1, -1)')
						      .attr('class', clsName);
					}
					return g;
				},

				addAxes:function(){
					this.addXAxis();
					this.addYAxis();
					this.showTimeView();
				},

				addXAxis:function(){
					var g = this.getGroupById(groups.axes);
					var xAxis = defaultOptions.xAxisData;
					this.addLine(g, xAxis.xStart, 0, xAxis.xEnd, 0, 'chart-axis');

					xAxis.labels.forEach((function(l){
						this.addTextXForm(g, (l.xStart + l.xEnd)/2, 15, l.label, 'st-text', 'middle');
						this.addLine(g, l.xEnd, 0, l.xEnd, -6, 'chart-axis');
					}).bind(this));
				},

				addYAxis:function(){
					var g = this.getGroupById(groups.axes);
					var yAxis = defaultOptions.yAxisData;
					var h = 0;
					this.addLine(g, yAxis.xStart, yAxis.yStart, yAxis.xEnd, yAxis.yEnd, 'chart-axis');
					yAxis.labels.forEach((function(l){
						if(settings.gtype === gTypes.STACKED)
							this.addTextXForm(g, l.xStart - 10, -l.yStart, l.slabel, 'st-text', 'end');
						else
							this.addTextXForm(g, l.xStart - 10, -l.yStart, l.label, 'st-text', 'end');
						this.addLine(g, l.xStart, l.yStart, l.xEnd, l.yEnd, 'chart-axis');
						h = l.yEnd;
					}).bind(this));

					var y = -h/2
					var x = -55;
					var gT = this.addTextXForm(g, x, y, yAxis.context, 'col-text', 'middle');
					gT.attr('transform', 'scale(1, -1) rotate(-90, ' + x + ',' + y + ')' );	
				},

				showTimeView:function(){
					var g = this.getGroupById(groups.times);
					g.html('');
					this.showBackNextControls();
					this.showTimeGroupView();
				},

				showBackNextControls:function(){
					var g = this.getGroupById(groups.backnext);
					g.html('');

					var barGroups = defaultOptions.barGroups;
					if(barGroups.length < 2) return;

					var xS = settings.w - (60+50);
					var yS = settings.h - 75;
					var rH = 25;
					var rW = 25;
					var gR = null;
					var labels = ['<', '>'];
					var id = 'stBack';
					labels.forEach((function(label){
						gR = this.addRectLabel(g, xS, yS, rW, rH, label, 'st-bn', 'st-bn-rect', 'st-bn-text', 'start');
						gR.attr('id', id);
						id = 'stNext';
						xS += rW;
					}).bind(this));
					gR.select('rect').classed('st-bn-select', true);
					gR.select('text').classed('st-bn-text-select', true);
					var self = this;
					$('.st-bn').on('click', function(e){
						self.onTimeGroupBackNext(this);
					});
				},

				onTimeGroupBackNext:function(selBackNext){
					d3.selectAll('.st-bn-select').classed('st-bn-select', false).classed('st-bn-rect', true);
					d3.selectAll('.st-bn-text-select').classed('st-bn-text-select', false).classed('st-bn-text', true);
					d3.select(selBackNext).select('rect').attr('class', 'st-bn-select');
					d3.select(selBackNext).select('text').attr('class', 'st-bn-text-select');
					var id = d3.select(selBackNext).attr('id');
					var barGroups = defaultOptions.barGroups;

					if(id === 'stBack'){
						currTimeModelIndex--;
						if(currTimeModelIndex < 0){
							currTimeModelIndex = 0;
							return;
						}
					}
					else{
						currTimeModelIndex++;		
						if(currTimeModelIndex >= barGroups.length){
							currTimeModelIndex = barGroups.length-1;
							return;
						}
					}
					this.showTimeGroupView();
				},

				showTimeGroupView:function(){
					var g = this.getGroupById(groups.times);
					g.html('');

					var barGroup = defaultOptions.barGroups[currTimeModelIndex];
					var allHeights = [];
					var swidth = (settings.gtype === gTypes.STACKED) ? this.stackiw : 0;		

					for(var key in barGroup){
						var bars = barGroup[key];
						var i = 1;
						var sheight = 0;
						bars.forEach((function(bar){
							if(bar.h > 0){
								var gR;
								if(settings.gtype === gTypes.STACKED){
									gR = this.addRect(g, swidth, (bar.y+sheight)*this.coEff, this.stackbw, 0, 'bar-' + i + ' bh');
									sheight+=bar.h;
									allHeights.push(bar.h*this.coEff);
								}
								else{
									gR = this.addRect(g, bar.x, bar.y, bar.w, 0, 'bar-' + i + ' bh');	
									allHeights.push(bar.h);								
								}
								gR.attr({label : bar.label, tKey : bar.tKey});
								
							}
							i++;
						}).bind(this));
						if(settings.gtype === gTypes.STACKED)
							swidth += this.stackxw;
					}
					this.addTimeGroupContentMarkers(g);
					this.animateCategoryHeights(g, allHeights);

					setTimeout(function(){
						this.showOutliersForCurrentTimeGroup()
					}.bind(this),  200);
					
					
					var self = this;
					$('.bh').on('click', function(e){
						var t = d3.select(this).attr('tKey');
						var onChartClick = defaultOptions.onChartClick;
						if(!onChartClick){
							return;
						}
						if(t.length > 2){
							var label = d3.select(this).attr('label');
							onChartClick(label,t);
						}
					});
				},

				animateCategoryHeights:function(g, heights){
					g.selectAll('.bh')
					 .data(heights)
					 .transition()
					 .attr('height', function(h) { return h; })
				},

				addTimeGroupContentMarkers :function(g){
					var timeGroup = defaultOptions.barGroups[currTimeModelIndex];
					var key = Object.keys(timeGroup)[0];
					var labels = [];
					timeGroup[key].forEach(function(l){
						labels.push(l.label);
					});

					var maxStrLen = d3.max(labels, function(s) { return s.length; });
					var d1 = 40;
					var d2 = d1 + 40;
					if(maxStrLen > 10){
						d2 += 30;
						d1 += 20;
					}

					var x = defaultOptions.xAxisData.xEnd/4;
					var y = -40;
					var i = 1;
					labels.forEach((function(c){
						this.addRect(g, x, y, 10, 10, 'bar-'+i);
						this.addTextXForm(g, x + d1, -y, c, 'col-text', 'middle');
						x+=d2;
						i++;
					}).bind(this));
				},

				addLine:function(g, x1, y1, x2, y2, cssLine){
					var l = g.append('line')
					 		 .attr({
					 			x1 : x1,
					 			y1 : y1,
					 			x2 : x2,
					 			y2 : y2,
					 			class : cssLine
					 		});
					return l;
				},

				addTextXForm: function(g, x, y, text, cssText, textAlign){
					var gX = g.append('g').attr('transform', 'scale(1, -1)');
					var t = this.addText(gX, x, y, text, cssText, textAlign);
					return gX;
				},
				addText: function(g, x, y, text, cssText, textAlign){
					var t = g.append('text')
							 .attr({
							 	x : x,
							 	y : y,
							 	class : cssText || 'col-text',
							 	'text-anchor' : textAlign || 'middle'
							 })
							 .text(text);
					return t;	
				},

				addRectLabel: function(g, x, y, w, h, text, cssGroup, cssRect, cssText, textAlign){
					var gLabel = g.append('g').attr('class', cssGroup);
					var r = gLabel.append('rect')
							 .attr({
							 	x : x,
							 	y : y,
							 	height : h,
							 	width : w,
							 	class : cssRect
							 });
							 this.addTextXForm(gLabel, x+w/6, -(y+h/2-3), text, cssText, textAlign);
					return gLabel;
				},

				addRect:function(g, x, y, w, h, cssRect){
					var r = g.append('rect')
					         .attr({
					         	x : x,
					         	y : y,
					         	height : h,
					         	width : w,
					         	class : cssRect
					         });
					return r
				},

				updateDefultSettings:function(userSettigs){
					if(userSettigs){
						for(var set in userSettigs){
							settings[set] = userSettigs[set];
						}
					}
				},

				updateDefaultOptions:function(userOptions){
					for(var opt in userOptions){
						defaultOptions[opt] = userOptions[opt];
					}
					var data = defaultOptions['data'];
					var xAxisData = data.axes.x;
					var yAxisData = data.axes.y;
					var groups = data.timeGroups;
					xAxisData?(defaultOptions['xAxisData'] = xAxisData):'';
					yAxisData?(defaultOptions['yAxisData'] = yAxisData):'';
					groups?(defaultOptions['barGroups'] = groups):'';
				},

				renderOutliers : function(data){
					defaultOptions['data'].outliers = data;
					this.showOutliersForCurrentTimeGroup();
				},

				showOutliersForCurrentTimeGroup : function(){
					var model = defaultOptions['data'].outliers;
					if(!model) return;

					var outliers = [];
					var id = 1;
					$.each($('.bh'), (function(idx, item){
						var t = d3.select(item);
						var label = t.attr('label');
						var tKey = t.attr('tKey');
						
						var olItems = model[tKey];
						if(olItems){
							var olItemsForLabel = _.where(olItems, {label : label});			
							if(olItemsForLabel.length > 0){
								outliers.push({
									rect : t,
									outlier : olItemsForLabel[0].outlier
								});
								id++;
							}
						}
					}).bind(this));
					if(outliers.length > 0)
						this.addMarkersForOutliers(outliers);
				},

				addMarkersForOutliers : function(outliers){
					var g = this.getGroupById(groups.times);
					outliers.forEach((function(ol){
						var x = parseFloat(ol.rect.attr('x'));
						var w = parseFloat(ol.rect.attr('width'));
						var y = parseFloat(ol.rect.attr('height'));
						x = x+w/2;
						var cssCircle = ol.outlier > 0 ? 'ol-pos-circle' : 'ol-neg-circle';
						var olText = ol.outlier > 0 ? '+' : '-';
						this.addBalloon(g, x, y, olText, 50, 5, 'chart-axis', cssCircle, 'ol-text');
					}).bind(this));
				},

				addBalloon : function(g, x, y, label, d, r, cssLine, cssCircle, cssText){
					var yAxis = defaultOptions.yAxisData;
					if( (y + d + 2*r) > yAxis.yEnd){
						d = yAxis.yEnd - (y + 2*r) + 28;
					}

					var cx = x;
					var cy = y + d + r;
					this.addLine(g, x, y, x, y+d, cssLine);
					this.addCircle(g, cx, cy, r, cssCircle);
					this.addTextXForm(g, cx, -cy+4, label, 'cssText', 'middle');	
				},

				addCircle : function(g, cx, cy, r, cssCircle){
					var c = g.append('circle')
					 		 .attr({
					 		 	cx : cx,
					 			cy : cy,
							 	r : r,
							 	class : cssCircle
							 })
					return c;	
				}
			};

			this.init = function(){
				privateFn.updateDefultSettings(userSettings);
				privateFn.updateDefaultOptions(userOptions);
				privateFn.init();
			}

			this.renderOutliers = function(data){
				privateFn.renderOutliers(data);
			}

			this.hasOutliers = function(){
				return privateFn.hasOutliers();
			}

			this.destroy = function(){
				if(resizeObj){
					resizeObj.clear();
				}
				resizeObj = null;
			}
		}
		return chart;
	})();
	NS.barChart = barChart;
})(window);