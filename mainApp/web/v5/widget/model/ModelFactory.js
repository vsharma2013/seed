(function(NS){
	var ResponseParser = NS.ResponseParser;
	var SalesTableModel = NS.SalesTableModel;
	var SalesTimeModel = NS.SalesTimeModel;

	function ModelFactory(){

	}

	ModelFactory.prototype.getFrameModel = function(apiRes, options,display,isCompare){
		if(isCompare){
			return this.getCompareFrameModel(apiRes, options,display);
		}
		else{
			return this.getSingleFrameModel(apiRes,options,display);
		}
	}

	ModelFactory.prototype.getSingleFrameModel = function(apiRes, options,display){
		var resParser = new ResponseParser();
		var uiObject = resParser.parse(apiRes);

		var tableModeler = new SalesTableModel();
		var tableModel = tableModeler.getModel(uiObject, options.container);

		var timeModeler = new SalesTimeModel();
		var timeModel = timeModeler.getModel(uiObject, options.timeline);

		function strToFirstUpper(str){
			return str.replace(str[0], str[0].toUpperCase());
		}
		var frames = [];
		var count = 0;
		tableModel.forEach((function(tm){
			if(tm.tableTitle == display){
				frames.push({
					type : tm.tableTitle,
					label : strToFirstUpper(tm.tableTitle, options),
					container : this.getContainer(tm, options),
					timeline : this.getTimeLine(timeModel[count], tm.tableTitle, options)
				});
				count++;
			}
		}).bind(this));
		return frames;
	}

	ModelFactory.prototype.getTimeLine = function(time, type, options){
		for(var key in time){
			var k = key;
			if(time[k].type == type){
				if(!time.axes.y[k]){
					continue;
				}
				var yAxis = {
					labels : time.axes.y[k].labels,
					yScale : time.axes.y[k].yScale,
					xStart : time.axes.y.xStart,
					yStart : time.axes.y.yStart,
					xEnd : time.axes.y.xEnd,
					yEnd : time.axes.y.yEnd,
				}
				return {
					axes :{
						x :  time.axes.x,
						y :  yAxis
					},
					timeGroups : time[k].timeGroups,
					type : type
				}
			}
		}
		
	}

	ModelFactory.prototype.getContainer = function(table, options){
		var container = {
			sectors : {
				top : [],
				others : [],
				totalCount : 0,
				othersCount : 0
			},
			type : table.tableTitle,
			queryDetails : table.queryDetails
		};

		var key = table.levels > 1 ? 'columns' : 'cells';
		var allSectors = table[key];
		for(var i = 0 ; i < allSectors.length ; i++){
			if(i < 5){
				container.sectors.top.push({
					key : allSectors[i].key,
					count : allSectors[i].count
				});
			}
			else{
				container.sectors.others.push({
					key : allSectors[i].key,
					count : allSectors[i].count
				});
				container.sectors.othersCount += allSectors[i].count;
			}
			container.sectors.totalCount += allSectors[i].count;
		}
		return container;
	}


	ModelFactory.prototype.getDefaultCompareModelTmpl = function(type,label){
		var templ = {
			type : type,
			label: label,
			sectors : {},
			timelines : []
		};
		return templ;
	}

	ModelFactory.prototype.getCompareFrameModel = function(apiRes, options,display){
		var fms = this.getFrameModel(apiRes, options,display);
		var mainModel = {};
		fms.forEach(function(fm){
			var type = fm.type;
			var label = fm.label;
			var tLabels = [];
			if(!mainModel[type]){
				mainModel[type] = this.getDefaultCompareModelTmpl(type,label);
			}
			var model = mainModel[type];
			var sectors = model.sectors;
			fm.container.sectors.top.forEach(function(s){
				var sectorKey = s.key;
				if(!sectors[sectorKey]){
					sectors[sectorKey] = {
						count : s.count,
						label : s.key,
						type : fm.container.type
					}
				}
				else{
					sectors[sectorKey].count += s.count;
				}
				tLabels.push(s.key);
			});
			var timelines = this.getTimeLinesForCompare(fm.timeline, tLabels);
			model.timelines = this.CollateTimelines(model.timelines,timelines)

		}.bind(this));
		return mainModel;
	}

	ModelFactory.prototype.getCompareFrameModelOld = function(apiRes, options){
		var fms = this.getFrameModel(apiRes, options);
		var model = this.getDefaultCompareModelTmpl();
		fms.forEach((function(fm){		
			if(this.isProductType(fm.container.type)){
				var tLabels = [];
				model.product.type = fm.type;
				model.product.label = fm.label;
				fm.container.sectors.top.forEach(function(s){
					model.product.sectors.push({
						count : s.count,
						label : s.key,
						type : fm.container.type
					});
					tLabels.push(s.key);
				});
				//model.product.timelines = this.getTimeLinesForCompare(fm.timeline, tLabels);
			}
			else if(this.isRegionType(fm.container.type)){
				var tLabels = [];
				model.region.type = fm.type;
				model.region.label = fm.label;
				fm.container.sectors.top.forEach(function(s){
					model.region.sectors.push({
						count : s.count,
						label : s.key,
						type : fm.container.type
					});
					tLabels.push(s.key);
				});
				//model.region.timelines = this.getTimeLinesForCompare(fm.timeline, tLabels);
			}
		}).bind(this));	
		console.log(fms);	
		return model;
	}

	ModelFactory.prototype.isProductType = function(p){
		var productTypes = ['category', 'categories', 'type', 'types', 'brand', 'brands', 'model', 'models'];
		return _.contains(productTypes, p);
	}

	ModelFactory.prototype.isRegionType = function(r){
		var regionTypes = ['regions', 'region', 'states', 'state', 'cities', 'city'];
		return _.contains(regionTypes, r);
	}

	ModelFactory.prototype.CollateTimelines = function(eTimeline,nTimeline){
		var finTimeline = [];
		var labelTimelineMap = {};
		eTimeline.forEach(function(et){
			var elabel = et.label;
			labelTimelineMap[elabel] = et.timeline;
		});

		nTimeline.forEach(function(nt){
			var nlabel = nt.label;
			if(!labelTimelineMap[nlabel]){
				labelTimelineMap[nlabel] = nt.timeline;
			}
			else{
				var timeline = labelTimelineMap[nlabel];
				var timeGroups = {};
				nt.timeline.timeGroups.forEach(function(tg){
					var etg = timeline.timeGroups[0];
					for(var key in tg){
						var dg = tg[key];
						if(dg){
							if(!etg[key]){
								etg[key] = dg;
							}
							else{
								var em = etg[key];
								em.count += dg.count;
								em.h += dg.h;
							}
						}
					}
				});
			}
		});

		for(var label in labelTimelineMap){
			finTimeline.push({
				label:label,
				timeline:labelTimelineMap[label]
			})
		}
		return finTimeline;
	}

	ModelFactory.prototype.getTimeLinesForCompare = function(timeline, tLabels){
		if(!timeline){
			return [];
		}
		var tlArr = [];
		tLabels.forEach(function(tl){
			tlArr.push(JSON.parse(JSON.stringify(timeline)));
		});
		var copyTLables = tLabels.slice(0);
		copyTLables.reverse();
		
		tlArr.forEach(function(tl){
			var tgs = tl.timeGroups;
			var timeLabel = copyTLables.pop();
			tgs.forEach(function(tg){
				Object.keys(tg).forEach(function(k){
					var arrTime = tg[k];
					var toKeep = _.where(arrTime, {label : timeLabel})[0];
					tg[k] = toKeep;
				});
			});
		});
		copyTLables = tLabels.slice(0);
		copyTLables.reverse();
		var timelines = [];
		tlArr.forEach(function(tl){
			timelines.push({
				label : copyTLables.pop(),
				timeline : {
					axes : tl.axes,
					timeGroups : tl.timeGroups
				}			
			});
		});
		return timelines;
	}

	ModelFactory.prototype.getOutlierModel = function(apiRes, options){
		return new OutlierModel().getModel(apiRes, options);
	}

	NS.ModelFactory = ModelFactory;
})(window);