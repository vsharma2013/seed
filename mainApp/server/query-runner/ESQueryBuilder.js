var config = require('./../../config/config');
var commonUtils = require('../utils/commonUtils');

function MatchQuery(fileId){
	this.query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				match: {
				}
			}
		}

	}
}

MatchQuery.prototype.addMatch = function(key, value){
	this.query.body.query.match[key] = value;
}

MatchQuery.prototype.addDateRange = function(start, end){
	this.query.body.filter = {
		range:{
			timestamp : {
				gte : start,
				lte : end
			}
		}
	};
}

MatchQuery.prototype.toESQuery = function(){
	return this.query;
}

function MatchQueryWithSingleField(fileId){
	this.query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				filtered: {
					query :{
						match: {
						}
					},
					filter : {
						and:[
						]
					}

				}		
			}
		}
	};
} 

MatchQueryWithSingleField.prototype.addMatch = function(key, value){
	this.query.body.query.filtered.query.match[key] = value;
}

MatchQueryWithSingleField.prototype.addField = function(key, value){
	var query = {
		'term':{
			
		}
	};
	query.term[key] = value;
	this.query.body.query.filtered.filter.and.push(query);
}

MatchQueryWithSingleField.prototype.toESQuery = function(){
	return this.query;
}

function MatchQueryWithAndFilters(fileId){
	this.query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				filtered: {
					query :{
						match: {
						}
					},
					filter : {
						and : [
						]						
					}
				}		
			}
		}
	}
}

MatchQueryWithAndFilters.prototype.addMatch = function(key, value){
	this.query.body.query.filtered.query.match[key] = value;
}

MatchQueryWithAndFilters.prototype.addAndFilter = function(key, value){
	var term = {term: {}};
	term.term[key] = value;
	this.query.body.query.filtered.filter.and.push(term);
}

MatchQueryWithAndFilters.prototype.addDateRange = function(start, end){
	var range = {
		range : {
			timestamp : {
				gte : start,
				lte : end
			}
		}
	}
	this.query.body.query.filtered.filter.and.push(range);
}

MatchQueryWithAndFilters.prototype.toESQuery = function(){
	return this.query;
}

function MatchQueryWithOrFilters(fileId){
	this.query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				filtered: {
					query :{
						match: {
						}
					},
					filter : {
						or : [
						]
						
					}

				}		
			}
		}
	}
}

MatchQueryWithOrFilters.prototype.addMatch = function(key, value){
	this.query.body.query.filtered.query.match[key] = value;
}

MatchQueryWithOrFilters.prototype.addOrFilter = function(key, value){
	var term = {term: {}};
	term.term[key] = value;
	this.query.body.query.filtered.filter.or.push(term);
}

MatchQueryWithOrFilters.prototype.toESQuery = function(){
	return this.query;
}




function MatchQueryWithAndOrFilters(fileId){
	this.query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				filtered: {
					query :{
						match: {
						}
					},
					filter : {
						and :[
						],
						or : [
						]					
					}
				}		
			}
		}
	}
}

MatchQueryWithAndOrFilters.prototype.addMatch = function(key, value){
	this.query.body.query.filtered.query.match[key] = value;
}

MatchQueryWithAndOrFilters.prototype.addOrFilter = function(key, value){
	var term = {term: {}};
	term.term[key] = value;
	this.query.body.query.filtered.filter.or.push(term);
}

MatchQueryWithAndOrFilters.prototype.addAndFilter = function(key, value){
	var term = {term: {}};
	term.term[key] = value;
	this.query.body.query.filtered.filter.and.push(term);
}

MatchQueryWithAndOrFilters.prototype.toESQuery = function(){
	return this.query;
}

function FilterOnly(fileId){
	this.query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				filtered: {
					query :{
						match_all: {
						}
					},
					filter : {
						and :[
						],
						or : [
						]					
					}
				}		
			}
		}
	}

}

FilterOnly.prototype.addOrFilter = function(key, value){
	var term = {term: {}};
	term.term[key] = value;
	this.query.body.query.filtered.filter.or.push(term);
}

FilterOnly.prototype.addAndFilter = function(key, value){
	var term = {term: {}};
	term.term[key] = value;
	this.query.body.query.filtered.filter.and.push(term);
}

FilterOnly.prototype.addDateRange = function(start, end){
	var range = {
		range : {
			timestamp : {
				gte : start,
				lte : end
			}
		}
	}
	this.query.body.query.filtered.filter.and.push(range);
}

FilterOnly.prototype.toESQuery = function(){
	return this.query;
}

function getRootQuery(fileId){
	return {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				match_all: {
				}
			},
			aggs:{
				categories : {
					terms : {
						field : 'category',
						size : 5
					},
					aggs : {
						types : {
							terms : {
								field : 'type',
								size : 50
							},
							aggs : {
								brands : {
									terms : {
										field : 'brand',
										size : 50
									}
								}
							}
						},
						yearly : {
							date_histogram : {
								field : 'timestamp',
								interval : 'year',
								format : 'YYYY/MM/DD'
							}
						}
					}
				},
				regions: {
					terms : {
						field : 'region',
						size : 5
					},
					aggs : {
						states : {
							terms : {
								field : 'state',
								size : 50
							},
							aggs : {
								cities : {
									terms : {
										field : 'city',
										size : 50
									}
								}
							}
						},
						yearly : {
							date_histogram : {
								field : 'timestamp',
								interval : 'year',
								format : 'YYYY/MM/DD'
							}
						}
					}
				}
			}			
		}
	};
};

function matchAllQuery(fileId){
	var query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				"match_all": {}
			}
		}
	}
	return query;
};

function QueryForTermsAndFilters(fileId){
	this.query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				filtered: {
					filter :{
						bool : {
							must : []
						}
					}
				}		
			}
		}
	}
};

QueryForTermsAndFilters.prototype.toESQuery = function(){
	return this.query;
};

QueryForTermsAndFilters.prototype.addAllTerm = function(key,values){
	var must = this.query.body.query.filtered.filter.bool.must;

	if(values && values.length == 1){
		this.addTerm(must,key,values[0]);
	}
	else if(values.length > 1){
		this.addBoolShouldTerms(must,key,values);
	}
};

QueryForTermsAndFilters.prototype.addBoolShouldTerms = function(obj,key,values){
	var bool = {
		'bool':{
			'should':[]
		}
	};
	values.forEach(function(val){
		this.addTerm(bool.bool.should,key,val);
	}.bind(this));
	obj.push(bool);
};

QueryForTermsAndFilters.prototype.addTerm = function(obj,key,val){
	var term = {
		"term":{}
	};
	term.term[key] = val;
	obj.push(term);
};

QueryForTermsAndFilters.prototype.addDateRange = function(key,start, end){
	var range = {
		range : {
		}
	};

	range.range[key] = {
		gte : start,
		lte : end
	};
	
	this.query.body.query.filtered.filter.bool.must.push(range);
};

QueryForTermsAndFilters.prototype.addRange = function(key,rangeObj){
	var range = {
		range : {
		}
	};

	range.range[key] =rangeObj;
	this.query.body.query.filtered.filter.bool.must.push(range);
}




function CompareQueryWithTermsAndFilters(fileId){
	this.query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				filtered: {
					query :{
						bool : {
							should : {
								terms : {
								}
							}
						}
					},
					filter : {
						or : []
					}

				}		
			}
		}
	}
}

CompareQueryWithTermsAndFilters.prototype.addTerm = function(key, value){
	if(!this.query.body.query.filtered.query.bool.should.terms[key])
		this.query.body.query.filtered.query.bool.should.terms[key] = [];
	this.query.body.query.filtered.query.bool.should.terms[key].push(value);
}

CompareQueryWithTermsAndFilters.prototype.addFilter = function(key, value){
	var term = {term: {}};
	term.term[key] = value;
	this.query.body.query.filtered.filter.or.push(term);
}

CompareQueryWithTermsAndFilters.prototype.toESQuery = function(){
	if(this.query.body.query.filtered.filter.or.length === 0)
		delete this.query.body.query.filtered.filter;
	return this.query;
}

function MatchAllWithMultiAndFiltersQuery(fileId){
	this.query = {
		index: commonUtils.getIndexNameForSearchData(fileId),
		type: commonUtils.getTypeNameForSearchData(fileId),
		body: {
			query: {
				filtered: {
					query :{
						match_all: {
						}
					},
					filter : {
						and : []
					}
				}		
			}
		}
	};
}

MatchAllWithMultiAndFiltersQuery.prototype.addFilter = function(key, value){
	var term = {term: {}};
	term.term[key] = value;
	this.query.body.query.filtered.filter.and.push(term);
}

MatchAllWithMultiAndFiltersQuery.prototype.addDateRange = function(start, end){
	var range = {
		range : {
			timestamp : {
				gte : start,
				lte : end
			}
		}
	}
	this.query.body.query.filtered.filter.and.push(range);
}

MatchAllWithMultiAndFiltersQuery.prototype.toESQuery = function(){
	return this.query;
}

function MatchAllMultiAndWithAggsQuery(fileId){
	this.query = new MatchAllWithMultiAndFiltersQuery(fileId);
	this.aggs = {};
}

MatchAllMultiAndWithAggsQuery.prototype.addFilter = function(key, value){
	this.query.addFilter(key, value);
}

MatchAllMultiAndWithAggsQuery.prototype.addAggregator = function(key, size){
	this.aggs[key] = {
		terms : {
			field : key,
			size : size
		}
	};
}

MatchAllMultiAndWithAggsQuery.prototype.toESQuery = function(){
	var esQuery = this.query.toESQuery();
	esQuery.body['aggs'] = this.aggs;
	return esQuery;
}

module.exports = {
	getRootQuery : getRootQuery,
	MatchQuery : MatchQuery,
	MatchQueryWithSingleField : MatchQueryWithSingleField,
	MatchQueryWithAndFilters : MatchQueryWithAndFilters,
	MatchQueryWithOrFilters : MatchQueryWithOrFilters,
	MatchQueryWithAndOrFilters : MatchQueryWithAndOrFilters,
	FilterOnly : FilterOnly,
	CompareQueryWithTermsAndFilters : CompareQueryWithTermsAndFilters,
	MatchAllWithMultiAndFiltersQuery : MatchAllWithMultiAndFiltersQuery,
	QueryForTermsAndFilters:QueryForTermsAndFilters,
	matchAllQuery:matchAllQuery,
	MatchAllMultiAndWithAggsQuery : MatchAllMultiAndWithAggsQuery
}























