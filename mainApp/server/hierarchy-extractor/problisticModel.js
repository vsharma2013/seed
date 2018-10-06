var termMapExtractor = require('./termMap-extractor');
var problisticModel = function(conf){
	this.contextMap = {};
	this.esQueryHelper = conf.esQueryHelper;
	this.fileId = conf.fileId;
	this.contextUniqueItemMap = {};
	this.termMapExtractor = new termMapExtractor(conf);
}

problisticModel.prototype = {
	dispose:function(){
		this.termMapExtractor.dispose();
		this.termMapExtractor = null;
		this.contextMap = {};
		this.esQueryHelper = null;
		this.contextUniqueItemMap = {};
	},

	createProbalisticModel:function(callback){
		return this.termMapExtractor.getAllTermMap()
					.then(function(contextAllTermsMap){
						this.handleHierarchyModelForContextMap(contextAllTermsMap);
						console.log("Probalistic Model Extracted");
						return this.contextMap;
						//console.log(JSON.stringify(this.contextMap));
					}.bind(this));
	},
	handleHierarchyModelForContextMap:function(contextAllTermsMap){
		for(var context in contextAllTermsMap){
			var termMap = contextAllTermsMap[context].termMap;
			var totalCount = contextAllTermsMap[context].totalItems;
			var uniqueTerms = contextAllTermsMap[context].uniqueTerms;
			this.handleHierarchyModelForItemMap(termMap,context,totalCount,uniqueTerms);
		}
	},

	handleHierarchyModelForItemMap:function(termMap,termContext,totalCount,uniqueTerms){
		for(var term in termMap){
			var termObj = termMap[term];
			if(!this.contextMap[termContext]){
				this.contextMap[termContext] = {uniqueCount:uniqueTerms,count:totalCount,uniqueProbMap:{},termProbMap:{},contextsPercMap:{},uniquePercMap:{},termPercMap:{}};
			}
			this.calcProbForUniqueParent(termObj,termContext);
			this.calcProbForParentCount(termObj,termContext);
			this.calcPercForUniqueParent(termObj,termContext);
			this.calcPercForNoOfParent(termObj,termContext);
		}
	},

	calcProbForUniqueParent:function(termObj,termContext){
		var contextMap = termObj.contextMap;
		var uniqueProbMap = this.contextMap[termContext].uniqueProbMap;
		//this.contextMap[context].uniqueCount++;
		for(var mappedContext in contextMap){
			if(!uniqueProbMap[mappedContext]){
				uniqueProbMap[mappedContext] = {'tCount':0,'tProb':0,'prob':0};
			}
			var mappedUniqueCnt = contextMap[mappedContext].uniqueCount;
			var prob = 0;
			if(mappedUniqueCnt == 1){
				prob = 1;
			}
			uniqueProbMap[mappedContext].tCount++;
			uniqueProbMap[mappedContext].tProb += prob;
			uniqueProbMap[mappedContext].prob = uniqueProbMap[mappedContext].tProb/uniqueProbMap[mappedContext].tCount;
		}
	},

	calcProbForParentCount:function(termObj,termContext){
		var contextMap = termObj.contextMap;
		var mainTermcount = termObj.count;
		var termProbMap = this.contextMap[termContext].termProbMap;
		var termMap = termObj.terms;
		for(var term in termMap){
			var mappedTermObj = termMap[term];
			var mappedTermCnt = mappedTermObj.count;
			var mappedTermContext = mappedTermObj.context;
			if(!termProbMap[mappedTermContext]){
				termProbMap[mappedTermContext] = {'tCount':0,'tProb':0,'prob':0};
			}
			var termRatio = mappedTermCnt/mainTermcount;
			var prob = 0;
			if(termRatio == 1){
				prob = 1;
			}
			termProbMap[mappedTermContext].tCount++;
			termProbMap[mappedTermContext].tProb += prob;
			termProbMap[mappedTermContext].prob = termProbMap[mappedTermContext].tProb/termProbMap[mappedTermContext].tCount;
		}
	},

	/*calcTermPercForNoOfParent:function(termObj,termContext){
		var contextMap = termObj.contextMap;
		var termPercMap = this.contextMap[termContext].termPercMap;
		for(var mappedContext in contextMap){
			if(!termPercMap[mappedContext]){
				termPercMap[mappedContext] = {'tCount':0,'tPerc':0,'perc':0};
			}
			var mappedTotalCnt = contextMap[mappedContext].
		}

	},*/

	calcPercForUniqueParent:function(termObj,termContext){
		var contextMap = termObj.contextMap;
		var totalTermRecords = termObj.count;
		var uniquePercMap = this.contextMap[termContext].uniquePercMap;
		//var cnt = termObj.count;
		//this.contextMap[context].uniqueCount++;
		for(var mappedContext in contextMap){
			if(!uniquePercMap[mappedContext]){
				uniquePercMap[mappedContext] = {'tCount':0,'tPerc':0,'perc':0};
			}
			var mappedUniqueCnt = contextMap[mappedContext].uniqueCount;
			
			uniquePercMap[mappedContext].tCount++;
			uniquePercMap[mappedContext].tPerc += (1/mappedUniqueCnt);
			uniquePercMap[mappedContext].perc = uniquePercMap[mappedContext].tPerc/uniquePercMap[mappedContext].tCount;
		}
	},

	calcPercForNoOfParent:function(termObj,termContext){
		var contextMap = termObj.contextMap;
		var mainTermcount = termObj.count;
		var termPercMap = this.contextMap[termContext].termPercMap;
		var termMap = termObj.terms;
		for(var term in termMap){
			var mappedTermObj = termMap[term];
			var mappedTermCnt = mappedTermObj.count;
			var mappedTermContext = mappedTermObj.context;
			if(!termPercMap[mappedTermContext]){
				termPercMap[mappedTermContext] = {'tCount':0,'tPerc':0,'perc':0};
			}
			var perc = 1/mappedTermCnt;
			termPercMap[mappedTermContext].tCount++;
			termPercMap[mappedTermContext].tPerc += perc;
			termPercMap[mappedTermContext].perc = termPercMap[mappedTermContext].tPerc/termPercMap[mappedTermContext].tCount;
		}
	}
}

module.exports = problisticModel;