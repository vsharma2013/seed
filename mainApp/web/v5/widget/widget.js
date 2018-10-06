(function(NS){
	var chartModel = NS.chartModel;
	var utils = NS.utils;
	var widget = function(widgetOptions){
		this.widgetOptions = widgetOptions;
		this.widgetModel = null;
		this.widgetFrame = null;
		this.uiChartObj = null;
	}

	widget.prototype.render = function(){
		var widgetFrame = this.renderWidgetFrame();
		this.widgetFrame = widgetFrame;
		this.renderWidgetChart();
	}

	widget.prototype.renderWidgetFrame = function(){
		this.widgetOptions.onChartStyleChange = this.handleChartTypeChange.bind(this);
		this.widgetOptions.onFullScreenClick = this.handleFullScreenForPanel.bind(this);
		var widgetFrame = new NS.widgetFrame(this.widgetOptions);
		widgetFrame.renderUI();
		return widgetFrame;
	}

	widget.prototype.renderWidgetChart = function(){
		var chartClass = this.widgetFrame.getChartContainerClass();
		var panel = this.widgetOptions.panel;
		var isDrillDownDisable = this.widgetOptions.disableDrillDown;
		var data = this.widgetOptions['data'];
		var outliers = (data && data.outliers) ? data.outliers[panel.display] : null;
		this.widgetModel = new chartModel(panel,data);
		this.widgetModel.init(function(){
			var data = this.widgetModel.getDataForChart();
			if(data){
				var chart = {}
				chart.contClass = chartClass;
				chart.data = this.widgetModel.getDataForChart();
				chart.data.outliers = outliers;
				chart.isCompare = this.widgetModel.isCompareQuery();
				chart.id = panel.chartType;
				chart.settings = panel.chartSettings;
				if(!isDrillDownDisable){
					chart.onChartClick = this.handleClickEvent.bind(this);
				}
				var uiLib = new NS.uiLib();
				this.uiChartObj = uiLib.renderComponent(chart);
			}
			else{
				//this.widgetFrame.destroy();
			}
			this.updateWidgetCount();
		}.bind(this));
	}

	widget.prototype.updateWidgetCount = function(){
		var recordsCount = this.widgetModel.getRecordsCount();
		var countClass = this.widgetFrame.getCountContainerClass();
		$('.'+countClass).text(recordsCount);
	}

	widget.prototype.getErrorKeys = function(){
		return this.widgetModel.getErrorMapFromQuery();
	}

	widget.prototype.handleClickEvent =function(label,tKey){
		d3.selectAll('.nvtooltip').remove();
		var isCompare = this.widgetModel.isCompareQuery();
		if(isCompare){
			utils.showMessage('COMPARE_DRILLDOWN_DISABLE');
			return;
		}
		var params = {
			label : label,
			tKey:tKey,
			type : this.widgetModel.getDisplay()
		};

		var queryObj = this.widgetModel.executeSearchOnDrillDown(params);
		if(queryObj){
			routie('#app/drill/'+this.widgetModel.getDataId() + '/' + btoa(queryObj.queryStr) + '/' + btoa(JSON.stringify(queryObj.query)));
		}
		else{
			alert("Error while drilldown");
		}
	}

	widget.prototype.handleChartTypeChange = function(){
		var chartType = this.widgetFrame.getChartType();
		this.renderByChartType(chartType);
	}

	widget.prototype.renderByChartType = function(chartType){
		this.disposeUiChartObj();
		var panel = this.widgetOptions.panel;
		if(panel){
			panel.chartType = chartType;
		}
		this.renderWidgetChart();
		if(this.widgetOptions.onChartChange){
			this.widgetOptions.onChartChange(chartType);
		}
	}

	widget.prototype.renderOutliers = function(res){
		var panel = this.widgetOptions.panel;
		var data = this.widgetOptions['data'];
		if(!data.outliers){
			data.outliers = {};
		}
		data.outliers[panel.display] = res;
		this.widgetFrame.setChartType(2);
		panel.chartType = 2; //Show bar chart for outlier
		this.disposeUiChartObj();
		this.renderWidgetChart();
	}

	widget.prototype.disposeUiChartObj = function(){
		if(this.uiChartObj){
			this.uiChartObj.destroy();
			this.uiChartObj = null;
			var chartClass = this.widgetFrame.getChartContainerClass();
			$('.' + chartClass).empty();
		}
	}

	widget.prototype.getQueryStrForPanel = function(){
		return this.widgetModel.getQueryStrForPanel();
	}

	widget.prototype.getQueryPanelRecordsCount = function(){
		var recordsCount = this.widgetModel.getRecordsCount();
		return recordsCount;
	}

	widget.prototype.handleFullScreenForPanel = function(){
		this.widgetFrame.expandWidget();
	}

	widget.prototype.destroy = function(){
		this.widgetOptions = null;
		this.widgetModel = null;
		this.disposeUiChartObj();
		this.widgetFrame.destroy();
	}

	NS.widget = widget;
})(window);