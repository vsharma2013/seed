var _ = require('underscore');
var QueryParseListenerBase = require('./antlr/generated/sales_rewriteListener').sales_rewriteListener;
var logger = require('./../utils/Logger');
var sc = require('./../../config/config').searchContext;
var contextManager = require('./contextManager');


function QueryParseListener(fileId,cbOnExitQuery){
	QueryParseListenerBase.call(this);
	this.cbOnExitQuery = cbOnExitQuery;
	this.contextObj = new contextManager(fileId);
	this.memory = [];
	this.camparers = [];
	this.currentCompareObj = null;
	this.fileId = fileId;
	this.operator = null;
	this.timeSpec = null;
	this.relationOperator = null;
	return this;
}

QueryParseListener.prototype = Object.create(QueryParseListenerBase.prototype);
QueryParseListener.constructor = QueryParseListener;

QueryParseListener.prototype.enterQuery = function(ctx){
	this.memory = [];
	this.camparers = [];
	this.currentCompareObj = null;
	this.operator = null;
	this.timeSpec = null;
	this.relationOperator = [];
	logger.log('enter query');
}

QueryParseListener.prototype.exitQuery = function(ctx){
	//this.memory.searchContext = this.contextObj.getSearchContext(keys);
	this.getQueryMap(function(queryMap,queryErrorMap){
		logger.log(' Enter query map query');
		this.getCompareMap(function(compareMap,compErrorMap){
			this.createFilterForQuery(queryMap,compareMap,function(filterObj){
				logger.log(' Enter compare map query');
				var errorMap = this.collateErrorMaps(queryErrorMap,compErrorMap);
				var memory = {
					query : queryMap,
					compareMap:compareMap,
					filters:filterObj.filter,
					errorMap:errorMap,
					operator:this.operator?this.operator:'Count',
					relationOperator:this.relationOperator.length > 0?this.relationOperator:null,
					dateRange:filterObj.defaultDateRange
				};
				
				var isParseSuccess = this.isQueryParseSuccess(memory);
				if(!isParseSuccess){
					this.getQueryMapForAll(function(query){
						memory.query = query;
						this.cbOnExitQuery({
							success: true, 
							data : memory
						});
					}.bind(this));
				}
				else{
					this.cbOnExitQuery({
						success: true, 
						data : memory
					});
				}
			}.bind(this));
		}.bind(this));
	}.bind(this));
	//console.log(JSON.stringify(this.memory));
	logger.log('exit query');
};

QueryParseListener.prototype.getQueryMapForAll = function(callback){
	this.contextObj.createQueryMapForAll(callback);
};

QueryParseListener.prototype.isQueryParseSuccess = function(data){
	var isQuerySuccess = false;
	
	if(data.query){
		isQuerySuccess = true;
		var queryKeys = Object.keys(data.query);
		if(queryKeys.length == 0){
			isQuerySuccess = false; 
		}
	}

	var compareMap = data.compareMap?data.compareMap:false;
	var isCompareSuccess = false;
	if(compareMap){
		isCompareSuccess = true;
		compareMap.forEach(function(comp){
			var compareKeys = comp?Object.keys(comp.compare):null;
			var withKeys = comp?Object.keys(comp.with):null;
			if(compareKeys.length == 0){
				isCompareSuccess = false; 
			}

			if(withKeys.length == 0){
				isCompareSuccess = false; 
			}
		});
	}

	/*var isFilterSuccess = false;
	var filters = data.filters?data.filters:false;
	if(filters){
		isFilterSuccess = true;
		var and = filters.and;
		if(and.length == 0){
			isFilterSuccess = false; 
		}
	}*/

	if(isQuerySuccess || isCompareSuccess){
		return true;
	}
	else{
		return false;
	}
}

QueryParseListener.prototype.createFilterForQuery = function(queryMap,compareMap,callback){
	this.contextObj.handleFilterForTheContexts(queryMap,compareMap,this.timeSpec,callback);
}


QueryParseListener.prototype.getQueryMap =function(callback){
	var textObjs = this.memory;
	if(textObjs.length ==0){
		callback(null);
		return;
	}
	var resKeyValueMap = {};
	var resErrorMap = {};
	var objsCount = textObjs.length;
	var self = this;

	var resCallback = function(keyValueMap,errorMap){
		for(var key in keyValueMap){
			if(!resKeyValueMap[key]){
				resKeyValueMap[key] = keyValueMap[key];
			}
			else{
				resKeyValueMap[key] = resKeyValueMap[key].concat(keyValueMap[key]);
			}
		}

		for(var text in errorMap){
			resErrorMap[text] = errorMap[text];
		}
		objsCount--;
		if(objsCount <= 0){
			self.contextObj.getDefaultDateContext(function(defaultDateObj){
				if(defaultDateObj){
					for(var key in defaultDateObj){
						var dateValues = resKeyValueMap[key];
						var defaultDateContext = defaultDateObj[key];
						var flg = false;
						dateValues.forEach(function(val){
							if(val != defaultDateContext){
								flg = val;
							}
						});
						if(flg){
							resKeyValueMap[key] = [flg];
						}
						else{
							resKeyValueMap[key] = [defaultDateContext];
						}
					}
				}

				self.contextObj.getDefaultNumContext(function(defaultNumObj){
					if(defaultNumObj){
						for(var key in defaultNumObj){
							var numValues = resKeyValueMap[key];
							var defaultNumContext = defaultNumObj[key];
							var flg = false;
							numValues.forEach(function(val){
								if(val != defaultNumContext){
									flg = val;
								}
							});
							if(flg){
								resKeyValueMap[key] = [flg];
							}
							else{
								resKeyValueMap[key] = [defaultNumContext];
							}
						}
					}
				//var dateDomain = resKeyValueMap["date_domain"];
				//dateDomain
					callback(resKeyValueMap,resErrorMap);
				});
			});
		}
	};

	textObjs.forEach(function(textObj){
		var texts = Object.keys(textObj);
		this.contextObj.getKeyFromContextObj(texts,this.fileId,false,function(keyValueMap,errorMap){
			resCallback(keyValueMap,errorMap);
		});
	}.bind(this));
	
};

QueryParseListener.prototype.getCompareMap=function(callback){
	var comparerMap = [];
	var camparers = this.camparers; 
	function onDoneCallback(resp){
		comparerMap.push(resp);
		if(comparerMap.length === camparers.length){
			callback(comparerMap);
		}
	}

	if(camparers && camparers.length > 0){
		camparers.forEach(function(comparer){
			var compareTexts = comparer.compare;
			var withTexts = comparer.with;
			this.contextObj.getKeyFromContextObj(compareTexts,this.fileId,true,function(compareMap,compErrorMap){
				this.contextObj.getKeyFromContextObj(withTexts,this.fileId,true,function(withMap,withErrorMap){
					var errorMap = this.collateErrorMaps(compErrorMap,withErrorMap);
					onDoneCallback({'compare':compareMap,'with':withMap},errorMap);
				}.bind(this));
			}.bind(this));
		}.bind(this));
	}
	else{
		callback(null);
	}
};

QueryParseListener.prototype.collateErrorMaps = function(errMap1,errMap2){
	for(var key in errMap2){
		errMap1[key] = errMap2[key];
	}
	return errMap1;
};

// Enter a parse tree produced by sales_rewriteParser#compareFirstTermSpec.
QueryParseListener.prototype.enterCompareFirstTermSpec = function(ctx) {
	var multipleSpec = ctx.multiple_entity_spec();
	this.currentCompareObj = null;
	this.addCompareKeys(multipleSpec,true);
};

// Enter a parse tree produced by sales_rewriteParser#compareSecondTermSpec.
QueryParseListener.prototype.enterCompareSecondTermSpec = function(ctx) {
	var multipleSpec = ctx.multiple_entity_spec();
	this.addCompareKeys(multipleSpec,false);
	this.currentCompareObj = null;
};

// Enter a parse tree produced by sales_rewriteParser#main_entity_spec.
QueryParseListener.prototype.enterMain_entity_spec = function(ctx) {
	var multipleSpec = ctx.multiple_entity_spec();
	
	//console.log('main');
	//console.log(JSON.stringify(spec));
	this.addQueryKeysToMemory(multipleSpec);
};

// Enter a parse tree produced by sales_rewriteParser#operator_spec.
QueryParseListener.prototype.enterOperator_spec = function(ctx) {
	var operatorSpec = ctx.operatorSpec();
	this.addOperatorKeys(operatorSpec);
};

// Enter a parse tree produced by sales_rewriteParser#operator_spec.
QueryParseListener.prototype.enterRelation_operatorSpec = function(ctx) {
	var relationObj = this.handleRelationShipOperatorKeys(ctx.relationOperatorSpec());
	var relationVal = parseInt(ctx.NUM());
	if(relationObj && relationVal){
		relationObj.val = relationVal;
		this.relationOperator.push(relationObj);
	}
};


// Enter a parse tree produced by sales_rewriteParser#timeSpec.
QueryParseListener.prototype.enterTime_spec = function(ctx) {
	this.timeSpec = ctx.timeSpec();
};


QueryParseListener.prototype.addQueryKeysToMemory = function(spec){
	if (spec.length === 0) return;
	var domainSpec = spec.domainSpec();
	if (domainSpec.length === 0) return;
	
	var textObj = {};
	domainSpec.forEach((function(s){
		var text = s.getText();
		textObj[text] = 1;
	}).bind(this));

	this.memory.push(textObj);
}

QueryParseListener.prototype.addOperatorKeys = function(spec){
	if (spec.length === 0) return;
	if(spec.SUMOPERATOR())
		this.operator = 'sum';

	if(spec.AVGOPERATOR())
		this.operator = 'avg';

	if(spec.MINOPERATOR())
		this.operator = 'min';

	if(spec.MAXOPERATOR())
		this.operator = 'max';
}

QueryParseListener.prototype.handleRelationShipOperatorKeys = function(spec){
	var relationSpec = null;
	var operator = null;

	if (spec.length === 0) return;
	if(spec.GREATER_THAN_OPERATOR()){
		relationSpec = spec.GREATER_THAN_OPERATOR();
		operator = '>';
	}

	if(spec.GREATER_THAN_EQUAL_OPERATOR()){
		relationSpec = spec.GREATER_THAN_EQUAL_OPERATOR();
		operator = '>=';
	}

	if(spec.LESS_THAN_OPERATOR()){
		relationSpec = spec.LESS_THAN_OPERATOR();
		operator = '<';
	}

	if(spec.LESS_THAN_EQUAL_OPERATOR()){
		relationSpec = spec.LESS_THAN_EQUAL_OPERATOR();
		operator = '<=';
	}

	if(relationSpec){
		var text = relationSpec.getText();
		return {'relation':text,'operator':operator};
	}

	return null;
}

QueryParseListener.prototype.addCompareKeys = function(spec,flgFirst){
	if (spec.length === 0) return;
	var domainSpec = spec.domainSpec();
	if (domainSpec.length === 0) return;

	if(!this.currentCompareObj){
		this.currentCompareObj = {
			'compare':[],
			'with':[]
		}
		
	}
	domainSpec.forEach(function(s){
		var text = s.getText();
		if(flgFirst){
			this.currentCompareObj.compare.push(text);
		}
		else{
			this.currentCompareObj.with.push(text);
		}
	}.bind(this));

	if(!flgFirst){
		if(this.currentCompareObj && this.currentCompareObj.compare.length > 0 && this.currentCompareObj.with.length > 0)
		this.camparers.push(JSON.parse(JSON.stringify(this.currentCompareObj)));
	}
}



QueryParseListener.prototype.getKeyFromContextObj = function(text){
	return this.contextObj.getDomainSpecForVal(text);
}

QueryParseListener.prototype.getKeyFromContextObj = function(textArr,callback){
	this.contextObj.getContextObj(textArr,this.fileId,function(contextObj){
		callback(contextObj);
	});
}

module.exports = QueryParseListener;