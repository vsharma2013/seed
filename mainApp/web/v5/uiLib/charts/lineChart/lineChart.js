(function(NS){
	var utils = NS.utils;
	var lineChart = (function(){
		var groups = {
			axes : 'st-axis',
			times : 'st-time',
			backnext : 'st-backnext'
		};

		var chart = function(userSettings,userOptions){
			var settings = {
				'h':200,
				'w':700
			};

			var defaultOptions = {
				contClass:'arc',
				data:[],
				onChartClick:null
			};

			var privateFn = {
				'init':function(){
					var data = defaultOptions.data;
					if(data && data.length >0){
						this.initYScale();
						this.addAxes();
						this.addTimeLines();
					}
				},

				initYScale:function(){
					var allValues = [];
					var data = defaultOptions.data;
					data.forEach(function(m){
						m.timeline.timeGroups.forEach(function(tg){
							Object.keys(tg).forEach(function(key){
								if(tg[key]){
									var count = tg[key].count || tg[key].totalCount;
									allValues.push(count);
								}
							});
						});
					});

					var h = settings.h - 80;
					var dS = 0;
					var dE = d3.max(allValues, function(v) {
								return v;
							 });
					var rS = 0;
					var rE = h;
					this.yScale = d3.scale.linear()
									   	  .domain([dS, dE])
										  .range([rS, rE]);

					var xAxis = data[0].timeline.axes.x;
					this.xAxisEnd = xAxis.labels[xAxis.labels.length - 1].xEnd;
					this.yLabels = [];

					for(var i = h/4 ; i <= h ; i += h/4){
						this.yLabels.push({
							xS : 0,
							yS : i,
							xE : this.xAxisEnd,
							yE : i,
							label : Math.round((dE/h) * i)
						});
					}
				},

				getGroupByClassName:function(clsName){
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

				addAxes :function(g){
					var g = this.getGroupByClassName(groups.axes);
					this.addXAxis(g);
					this.addYAxis(g);
				},

				addXAxis:function(g){
					var data = defaultOptions.data;
					var xAxis = data[0].timeline.axes.x;
					this.addLine(g, xAxis.xStart, 0, xAxis.xEnd, 0, 'chart-axis');
					xAxis.labels.forEach((function(l){
						this.addTextXForm(g, (l.xStart + l.xEnd)/2, 15, l.label, 'st-text', 'middle');
						this.addLine(g, l.xEnd, 0, l.xEnd, -6, 'chart-axis');
					}).bind(this));
				},

				addYAxis :function(g){
					var h = 0;
					this.addLine(g, 0, 0, 0, settings.h - 80, 'chart-axis');
					this.yLabels.forEach((function(l){
						this.addTextXForm(g, l.xS - 10, -l.yS, l.label, 'st-text', 'end');
						this.addLine(g, l.xS, l.yS, l.xE, l.yE, 'chart-axis');
						h = l.yE;
					}).bind(this));
					var y = -h/2
					var x = -40;
					var gT = this.addTextXForm(g, x, y, 'SALES', 'col-text', 'middle');
					gT.attr('transform', 'scale(1, -1) rotate(-90, ' + x + ',' + y + ')' );	
				},

				getXLabelEndPoints:function(xlabel){
					var data = defaultOptions.data;
					var xLabel = _.where(data[0].timeline.axes.x.labels, {label : xlabel})[0];
					return {
						xS : xLabel.xStart,
						xE : xLabel.xEnd
					};
				},
				addTimeLines:function(){
					var data = defaultOptions.data;
					var g = this.getGroupByClassName(groups.times);
					var self = this;
					var colors = utils.getDefaultColors();
					var mapLabelVsColor = {};
					data.forEach(function(m){
						m.timeline.timeGroups.forEach(function(tg){
							var c = colors.pop();
							mapLabelVsColor[m.label] = c;
							self.addTimeLine(g, tg, m.label, c);
						});
					});	
					this.addLabelMarkers(g, mapLabelVsColor);
				},

				addTimeLine :function(g, timeGroup, tlLabel, tlColor){
					var i = 0;
					var path = new Path();
					Object.keys(timeGroup).forEach((function(xLabel){
						var count = 0;
						if(timeGroup[xLabel]){
							if(!_.isUndefined(timeGroup[xLabel].count))
								count = timeGroup[xLabel].count;
							else if(!_.isUndefined(timeGroup[xLabel].totalCount))
								count = timeGroup[xLabel].totalCount;
						}
						var xL = this.getXLabelEndPoints(xLabel);
						var x = (xL.xS + xL.xE)/2;
						var y = this.yScale(count);
						i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
						i++
					}).bind(this));
					var p = g.append('path')
							 .attr({
							 	d : path.toString().replace('Z',''),
							 	class : 'def-chart-line',
							 	stroke : tlColor
							 });
				},

				addLabelMarkers:function(g, mapLabelVsColor){
					var xS = this.xAxisEnd;
					var yS = settings.h /2;

					for(var label in mapLabelVsColor){
						var color = mapLabelVsColor[label];
						var d = 10;
						var x1 = xS;
						var x2 = x1 + d;

						var l1 = this.addLine(g, x1, yS, x2, yS, 'chart-label-line');
						l1.attr('stroke', color);

						x1 = x2;
						x2 = x1+d;

						var r = this.addRect(g, x1, yS-d/2, d, d, '');
						r.attr('fill', color);
						
						x1 = x2;
						x2 = x1+d;

						var l2 = this.addLine(g, x1, yS, x2, yS, 'chart-label-line');
						l2.attr('stroke', color);

						x1 = x2;
						x2 = x1+d;

						var gT = this.addTextXForm(g, x2, -yS + 4, label, 'chart-label', 'start');
						gT.select('text').attr('fill', color);

						yS -= 20;
					}
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
				}
			};


			this.init = function(){
				privateFn.updateDefultSettings(userSettings);
				privateFn.updateDefaultOptions(userOptions);
				privateFn.init();
			}

			this.destroy = function(){
				
			}
		}

		return chart;
	})();
	NS.lineChart = lineChart;

	var pSpace = ' ';
	function Path(){
		this.path = '';
	}

	Path.prototype.moveTo = function(x, y){
		this.path += ( pSpace + 'M' + pSpace + x + pSpace + y);
	}

	Path.prototype.lineTo = function(x, y){
		this.path += ( pSpace + 'L' + pSpace + x + pSpace + y);
	}

	Path.prototype.arc = function(rx, ry, xRot, laf, sf, x, y){
		this.path += ( pSpace + 'A' + pSpace + rx + pSpace + ry + pSpace + xRot + pSpace + laf + pSpace + sf + pSpace + x + pSpace + y);
	}

	Path.prototype.toString = function(){
		this.path += pSpace + 'Z'
		return this.path;
	}

	Path.prototype.getPathForSectorArcAroundCenter = function(xC, yC, rI, rO, thetaS, thetaE){
		var x1 = xC + rI * Math.cos(thetaS);
		var y1 = yC + rI * Math.sin(thetaS);

		var x2 = xC + rO * Math.cos(thetaS);
		var y2 = yC + rO * Math.sin(thetaS);

		var x3 = xC + rO * Math.cos(thetaE);
		var y3 = yC + rO * Math.sin(thetaE);

		var x4 = xC + rI * Math.cos(thetaE);	
		var y4 = yC + rI * Math.sin(thetaE);

		var xCodts = [x1, x2, x3, x4];
		var yCodts = [y1, y2, y3, y4];

		var xMin = d3.min(xCodts, function(d) { return d;});
		var xMax = d3.max(xCodts, function(d) { return d;});
		var yMin = d3.min(yCodts, function(d) { return d;});
		var yMax = d3.max(yCodts, function(d) { return d;});

		var path = new Path();
		path.moveTo(x3, y3);
		path.arc(rO, rO, 0, 0, 0, x2, y2);
		path.lineTo(x1, y1);
		path.arc(rI, rI, 0, 0, 1, x4, y4);

		return {
			path : path,
			centroid : {
				x : (xMax + xMin)/2,
				y : (yMax + yMin)/2
			}
		}
	}
})(window);