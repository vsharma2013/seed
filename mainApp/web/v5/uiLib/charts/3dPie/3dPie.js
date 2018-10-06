(function(NS){
	var chart3dPie = function(userSettings,userOptions){
		var resizeObj = null;
		var settings = {
			'h':300,
			'w':500,
			'rx':150,
			'ry':120,
			'rh':30,
			'ir':0.4
		};

		var defaultOptions = {
			'contClass':'arc',
			'data':[],
			'onChartClick':null
		};

		var update = function(){
			var contClass = defaultOptions.contClass;
			var svg  = d3.select('.' + contClass);
			var height = svg.style('height');
			var width = svg.style('width');
			height = parseInt(height.replace("px",''));
			width = parseInt(width.replace("px",''));
			settings.h = height;
			settings.w = width;
			settings.rx = height/2;
			settings.ry = settings.rx - 30;
			svg.selectAll("*").remove();
			originAndContainerAdd();
			addSlices();
		}

		var init = function(){
			updateDefultSettings(userSettings);
			updateDefaultOptions(userOptions);
			originAndContainerAdd();
			addSlices();
			resizeObj = nv.utils.windowResize(update);
		};

		function originAndContainerAdd(){
			var h = settings.h;
			var w = settings.w;
			var contClass = defaultOptions.contClass;
			var xOrg = 0;
			var yOrg = h;
			settings.id = contClass + '_arc';
			var g = d3.select('.' + contClass).select('.sp-group');
			if(g.empty()){
				g = d3.select('.' + contClass)
			          .append('g')
				      .attr('class', 'sp-group');
			}
			g.attr('transform', 'scale(1, 1)').attr('id', settings.id);
			g.html('');
		};

		function addSlices(){
			var y = settings.h/2-10;
			var x = settings.w/2;
			var rx = settings.rx;
			var ry = settings.ry;
			var h = settings.rh;
			var ir = settings.ir;
			var id = settings.id;
			var data = defaultOptions.data;

			var _data = d3.layout.pie().sort(null).value(function(d) {return d.value;})(data);

			var slices = d3.select("#"+id).append("g").attr("transform", "translate(" + x + "," + y + ")").attr("class", "slices");

			slices.selectAll(".innerSlice").data(_data).enter().append("path").attr("class", "innerSlice")
				.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
				.attr("d",function(d){ return pieInner(d, rx+0.5,ry+0.5, h, ir);})
				.attr('id', function(d) { return d.data.label; })
				.each(function(d){this._current=d;});
	
			slices.selectAll(".topSlice").data(_data).enter().append("path").attr("class", "topSlice")
				.style("fill", function(d) { return d.data.color; })
				.style("stroke", function(d) { return d.data.color; })
				.attr("d",function(d){ return pieTop(d, rx, ry, ir);})
				.attr('id', function(d) { return d.data.label; })
				.each(function(d){this._current=d;});
	
			slices.selectAll(".outerSlice").data(_data).enter().append("path").attr("class", "outerSlice")
				.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
				.attr("d",function(d){ return pieOuter(d, rx-.5,ry-.5, h);})
				.attr('id', function(d) { return d.data.label; })
				.each(function(d){this._current=d;});

			slices.selectAll(".sp-pie-label").data(_data).enter().append("text").attr("class", "sp-pie-label")
				.attr("x",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
				.attr("y",function(d){ return 0.6*ry*Math.sin(0.5*(d.startAngle+d.endAngle));})
				.attr('id', function(d) { return d.data.label; })
				.text(getLabel).each(function(d){this._current=d;});

			handleClickEvent();	
		};

		function handleClickEvent(){
			var id = settings.id;
			$('#' + id).find('.innerSlice, .topSlice, .outerSlice, .sp-pie-label').unbind('click')
					.bind('click',onPieClick);
			
		};

		function onPieClick(e){
			var l = d3.select(this).attr('id');
			
			if(l !== 'Others'){
				var onChartClick = defaultOptions.onChartClick;
				if(!onChartClick){
					return;
				}
				onChartClick(l);
			}
			else{
				var d = d3.select(this).data();
				if(d && d.length >0){
					var data = d[0].data;
					showToolTip(data.keys,e);
				}
			}
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



		function pieInner(d, rx, ry, h, ir ){
			var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
			var endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);
			
			var sx = ir*rx*Math.cos(startAngle),
				sy = ir*ry*Math.sin(startAngle),
				ex = ir*rx*Math.cos(endAngle),
				ey = ir*ry*Math.sin(endAngle);

				var ret =[];
				ret.push("M",sx, sy,"A",ir*rx,ir*ry,"0 0 1",ex,ey, "L",ex,h+ey,"A",ir*rx, ir*ry,"0 0 0",sx,h+sy,"z");
				return ret.join(" ");
		};

		function pieOuter(d, rx, ry, h ){
			var startAngle = (d.startAngle > Math.PI ? Math.PI : d.startAngle);
			var endAngle = (d.endAngle > Math.PI ? Math.PI : d.endAngle);
			
			var sx = rx*Math.cos(startAngle),
				sy = ry*Math.sin(startAngle),
				ex = rx*Math.cos(endAngle),
				ey = ry*Math.sin(endAngle);
				
				var ret =[];
				ret.push("M",sx,h+sy,"A",rx,ry,"0 0 1",ex,h+ey,"L",ex,ey,"A",rx,ry,"0 0 0",sx,sy,"z");
				return ret.join(" ");
		};

		function pieTop(d, rx, ry, ir ){
			if(d.endAngle - d.startAngle == 0 ) return "M 0 0";
			var sx = rx*Math.cos(d.startAngle),
				sy = ry*Math.sin(d.startAngle),
				ex = rx*Math.cos(d.endAngle),
				ey = ry*Math.sin(d.endAngle);
				
			var ret =[];
			ret.push("M",sx,sy,"A",rx,ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0),"1",ex,ey,"L",ir*ex,ir*ey);
			ret.push("A",ir*rx,ir*ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0), "0",ir*sx,ir*sy,"z");
			return ret.join(" ");
		};

		function getLabel(d){
			return d.data.label;
		};

		function updateDefultSettings(userSettigs){
			if(userSettigs){
				for(var set in userSettigs){
					settings[set] = userSettigs[set];
				}
			}
		};

		function updateDefaultOptions(userOptions){
			for(var opt in userOptions){
				defaultOptions[opt] = userOptions[opt];
			}
		};

		this.init = function(){
			init();
		};

		this.destroy = function(){
			if(resizeObj){
				resizeObj.clear();
			}
			resizeObj = null;
		};
	};

	window.chart3dPie = chart3dPie;
})(window);