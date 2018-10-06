(function(NS){
	var widgetFrame = function(options){
		this.options = options;
	};

	widgetFrame.prototype.renderUI = function(){
         var panelContainer = addPanelContainer(this.options);
         var cnt= $('.'+ this.options.contClass);
         cnt.append(panelContainer);
         createChartStylePicker(this.options);
         this.bindEvents();
	};

	widgetFrame.prototype.getChartContainerClass = function(){
		var ctrlClasses = getControlClass(this.options.contClass);
		return ctrlClasses.CHART;
	};

	widgetFrame.prototype.getCountContainerClass = function(){
		return this.options.contClass + '_count';
	}

	widgetFrame.prototype.getChartType = function(){
		var ctrlClass = getControlClass(this.options.contClass);
		return $('.' + ctrlClass.CHARTSTYLE).selectpicker('val');
	}

	widgetFrame.prototype.expandWidget = function(){
		var ctrlClass = getControlClass(this.options.contClass);
		var panel = $('.' + ctrlClass.FULLSCREEN).parents(".panel");

	    if(panel.hasClass("panel-fullscreened")){
	        panel.removeClass("panel-fullscreened").unwrap();
	        var origHeight = panel.find('.chart-holder').attr('origHeight');
	        panel.find(".panel-body,.chart-holder").css("height",origHeight + 'px');
	        panel.find(".panel-fullscreen .fa").removeClass("fa-compress").addClass("fa-expand"); 
	        panel.find(".panel-fullscreen").attr('title',"Expand to fullscreen");      
	        
	        //$(window).resize();
	        window.dispatchEvent(new Event('resize'));
	    }else{
	        var head    = panel.find(".panel-heading");
	        var body    = panel.find(".panel-body");
	        var footer  = panel.find(".panel-footer");
	        var hplus   = 30;
	        
	        if(body.hasClass("panel-body-table") || body.hasClass("padding-0")){
	            hplus = 0;
	        }
	        if(head.length > 0){
	            hplus += head.height()+21;
	        } 
	        if(footer.length > 0){
	            hplus += footer.height()+21;
	        } 
	        var oldHeight =  panel.find('.chart-holder').height();
	        panel.find('.chart-holder').attr('origHeight',oldHeight);

	        panel.find(".panel-body,.chart-holder").height($(window).height() - hplus);
	        
	        panel.addClass("panel-fullscreened").wrap('<div class="panel-fullscreen-wrap"></div>');        
	        panel.find(".panel-fullscreen .fa").removeClass("fa-expand").addClass("fa-compress");
	        panel.find(".panel-fullscreen").attr('title',"Compress from fullscreen");
	        
	        //$(window).resize();
	        window.dispatchEvent(new Event('resize'));
	    }
	}

	widgetFrame.prototype.bindEvents = function(){
		var ctrlClass = getControlClass(this.options.contClass);
		bindClickEvent(ctrlClass.REFRESH,this.options.onRefreshClick);
		bindClickEvent(ctrlClass.EXPAND,this.options.onExpandClick);
		bindClickEvent(ctrlClass.DELETE,this.options.onCollapseClick);
		bindClickEvent(ctrlClass.REFRESH,this.options.onDeleteClick);
		bindClickEvent(ctrlClass.PIN,this.options.onPinClick);
		bindClickEvent(ctrlClass.UNPIN,this.options.onUnPinClick);
		bindClickEvent(ctrlClass.OUTLIER,this.options.onOutlierClick);
		bindClickEvent(ctrlClass.FULLSCREEN,this.options.onFullScreenClick);
		bindSelectChangeEvent(ctrlClass.CHARTSTYLE,this.options.onChartStyleChange);
	};

	widgetFrame.prototype.unBindEvents = function(){
		var ctrlClass = getControlClass(this.options.contClass);
		unBindClickEvent(ctrlClass.REFRESH);
		unBindClickEvent(ctrlClass.EXPAND);
		unBindClickEvent(ctrlClass.DELETE);
		unBindClickEvent(ctrlClass.REFRESH);
		unBindClickEvent(ctrlClass.PIN);
		unBindClickEvent(ctrlClass.UNPIN);
		unBindClickEvent(ctrlClass.OUTLIER);
		unBindClickEvent(ctrlClass.FULLSCREEN);
		unBindSelectChangeEvent(ctrlClass.CHARTSTYLE);
	};

	widgetFrame.prototype.destroy = function(){
		this.unBindEvents();
		$('.'+this.options.contClass).empty(); 
	};

	widgetFrame.prototype.setChartType = function(chartType){
		var ctrlClass = getControlClass(this.options.contClass);
		$('.' + ctrlClass.CHARTSTYLE).selectpicker('val',chartType);
	};

	function bindClickEvent(ctrlClass,callback){
		if(callback && typeof callback == 'function'){
			$('.'+ctrlClass).unbind('click').bind('click',callback);
		}
	};

	function unBindClickEvent(ctrlClass,callback){
		$('.'+ctrlClass).unbind('click');
	};

	function bindSelectChangeEvent(ctrlClass,callback){
		if(callback && typeof callback == 'function'){
			$('select.'+ctrlClass).unbind('changed.bs.select').bind('changed.bs.select',callback);
		}
	};

	function unBindSelectChangeEvent(ctrlClass,callback){
		$('.'+ctrlClass).off('changed.bs.select');
	};

	function createChartStylePicker(options){
		var ctrlClass = getControlClass(options.contClass);
		$('.' + ctrlClass.CHARTSTYLE).selectpicker({
			'width':'100px'
		});
		var chartType = options.panel.chartType;
		$('.' + ctrlClass.CHARTSTYLE).selectpicker('val',chartType);
	};

	function getControlClass(cntClass){
		var ctrlClass = {
			'REFRESH':cntClass + '_refresh',
			'EXPAND':cntClass + '_expand',
			'COLLAPSE':cntClass + '_collapse',
			'DELETE':cntClass + '_delete',
			'CHART':cntClass + '_dashboardContainer',
			'PIN':cntClass + '_pin',
			'UNPIN':cntClass + '_unpin',
			'OUTLIER' : cntClass + '_outlier',
			'CHARTSTYLE':cntClass + '_typestyle',
			'FULLSCREEN':cntClass + '_fullscreen',
		}
		return ctrlClass;
	};

	function addPanelContainer(options){
		var panelCont = $('<div class="panel panel-default"></div>');
		var panelheader = renderPanelHeading(options);
		panelCont.append(panelheader);
		var chartContainer = addChartContainer(options.contClass,options.height);
		panelCont.append(chartContainer);
		var panelFooter = addPanelFooter(options.contClass);
		panelCont.append(panelFooter);
		return panelCont;
	};

	function renderPanelHeading(options){
		var div = $('<div class="panel-heading"></div>');
		var panelTitleHtml = panelTitle(options.title,options.description);
		div.append(panelTitleHtml);
		var panelControlsHtml = panelControls(options);
		div.append(panelControlsHtml);
		return div;
	};

	function panelTitle(title,description){
		var html = '<div class="panel-title-box">'+
						'<h3>'+ title +'</h3>' + 
						'<span>' +description + '</span>'+
					'</div>';
		return html;
	};

	function panelControls(options){
		var ctrlClass = getControlClass(options.contClass);
		var olHtml = getOutlierOptionsHtml(options, ctrlClass)
		
		var html =  '<ul class="panel-controls" style="margin-top: 2px;">';
		html += getUIStyleDropDown(options,ctrlClass);
		if(options.onPinClick){
			html += olHtml;
			html += '<li><a title="Pin to dashboard" class="panel-pin '+ctrlClass.PIN+'"><span class="fa fa-thumb-tack"></span></a></li>';
		}
		if(options.onUnPinClick){
			html+= '<li><a title="UnPin from dashboard" class="panel-pin '+ctrlClass.UNPIN+'"><span class="fa fa-tint"></span></a></li>';
		}
        html+=  '<li><a title="Expand to fullscreen" class="panel-fullscreen '+ctrlClass.FULLSCREEN+'"><span class="fa fa-expand '+ctrlClass.EXPAND+'"></span></a></li>';
            			/*'<li><a class="panel-refresh"><span class="fa fa-refresh '+ctrlClass.REFRESH+'"></span></a></li>'+
		                '<li class="dropdown">'+
			                '<a class="dropdown-toggle" data-toggle="dropdown"><span class="fa fa-cog"></span></a>'+                                      
			                '<ul class="dropdown-menu">'+
			                    '<li><a class="panel-collapse"><span class="fa fa-angle-down '+ctrlClass.COLLAPSE+'"></span> Collapse</a></li>'+
			                    '<li><a class="panel-remove"><span class="fa fa-times '+ctrlClass.DELETE+'"></span> Remove</a></li>'+
			                '</ul>'+                                      
			            '</li>'+  */                                      
        html+= '</ul>';
		return html;   
	};

	function addChartContainer(contClass,height){
		var ctrlClass = getControlClass(contClass);
		var html =  '<div class="panel-body padding-0">'+
                        '<svg class="chart-holder '+ctrlClass.CHART+'" style="height: '+height+'px;width:100%;display:block;"></svg>'+
                    '</div>';
        return html;
	};

	function addPanelFooter(contClass){
		return '<div class="panel-footer text-center">'+
		            'Records:&nbsp<a class="'+contClass+'_count">0</a>'+
		       '</div>';
	};

	function getUIStyleDropDown(options, ctrlClass){
		var isTimeField = options.panel?(options.panel.timeField?true:false):false;
		var isCompare = options.panel?(options.panel.isCompare?true:false):false;

		if(isTimeField && !isCompare){
			return '<li> <select class="select '+ ctrlClass.CHARTSTYLE+'">'+
		              '<option value="2">Bar</option> ' + 
		              '<option value="8">Area</option> ' + 
		              '<option value="9">MultiBar</option> ' + 
		              '<option value="11">line</option> ' + 
		              // '<option value="7">HBar</option> ' +
		          	'</select><li>';
		}
		else if(isCompare && isTimeField){
			return '<li> <select class="select '+ ctrlClass.CHARTSTYLE+'">'+
		              '<option value="11">Line</option> ' + 
		              '<option value="8">Area</option> ' + 
		              '<option value="9">MultiBar</option> '+
		              // '<option value="7">HBar</option> ' +
		          	'</select><li>';
		}
		else{
			return '<li> <select class="select '+ ctrlClass.CHARTSTYLE+'">'+
		              '<option value="1">3D Pie</option> ' + 
		              '<option value="4">Bar</option> ' + 
		              '<option value="5">Pie</option> ' + 
		              '<option value="6">Donut</option> ' +
		              // '<option value="7">HBar</option> ' +
		          	'</select><li>';
	    }
	};

	function getOutlierOptionsHtml(options, ctrlClass){
		var isTimeField = options.panel?(options.panel.timeField?true:false):false;
		var isCompare = options.panel?(options.panel.isCompare?true:false):false;
		if(isTimeField && !isCompare){
			return '<li class="dummyOutlierOptBtnContainer" ><div class="dropdown panel-pin">'+
	               '<button class="dropdown-toggle panel-pin" type="button" data-toggle="dropdown">'+
	               '<i class="fa fa-bars"></i></button>' + 
					 '<ul class="dropdown-menu">' + 
					   '<li><a class="'+ ctrlClass.OUTLIER +'" mode="top">Outlier Top</a></li>' +
					 '</ul>' + 
				'</div><li>';
		}
		return '';
	}

	NS.widgetFrame = widgetFrame;
})(window);