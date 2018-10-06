var qb = require('./ESQueryBuilder');
var dtm = require('./../utils/DateTime');
var config = require('./../../config/config');
var logger = require('./../utils/Logger');
var _ = require('underscore');

function ESQueryHelper(fileId){
	this.fileId = fileId;
}

ESQueryHelper.prototype = {
	getESQuery :function(source,flgAll,relationOperators){
		var esQuery = new qb.QueryForTermsAndFilters(this.fileId);
		if(flgAll){
			return qb.matchAllQuery(this.fileId);
		}
		if(source.source && source.source.length > 0){
			source.source.forEach(function(queryItem){
				esQuery.addAllTerm(queryItem.key,queryItem.values);
			});
		}
		if(source.filters){
			var dateRange = dtm.getDateRangeFromFilters(source.filters);
			if(dateRange.hasDates){
				var dateDomain = source.dateDomain;
				if(dateDomain && dateDomain.length > 0){
					if(dateDomain[0] && dateDomain[0].values && dateDomain[0].values[0]){
						var dateDomainField = dateDomain[0].values[0];
						dateDomainField = dateDomainField + '_mod';
						esQuery.addDateRange(dateDomainField,dateRange.startDate, dateRange.endDate);
					}
				}
			}
		}
		this.handleRelationOperator(esQuery,source.numDomain,relationOperators);
		logger.log(JSON.stringify(esQuery.toESQuery()));
		return esQuery.toESQuery();
	},

	handleRelationOperator:function(esQuery,numDomain,relationOperator){
		if(numDomain && numDomain.length > 0 && relationOperator && relationOperator.length > 0){
			var rangeObj = {};
			relationOperator.forEach(function(relationObj){
				var esOperator = this.getESRelationOperator(relationObj.operator);
				if(esOperator){
					rangeObj[esOperator] = relationObj.val;
				}
			}.bind(this));
			if(numDomain[0] && numDomain[0].values && numDomain[0].values[0]){
				var numDomainField = numDomain[0].values[0];
				numDomainField = numDomainField + '_mod';
				esQuery.addRange(numDomainField,rangeObj);
			}
		}
	},

	getESRelationOperator:function(operator){
		var esOperator = null;
		switch(operator){
			case '>':
				esOperator = 'gt';
				break;
			case '>=':
				esOperator = 'gte';
				break;
			case '<':
				esOperator = 'lt';
				break;
			case '<=':
				esOperator = 'lte';
				break;
		}
		return esOperator;
	}
}
module.exports = ESQueryHelper;
