var elasticsearch = require('elasticsearch');
var request = require('request');
var config = require('./../../config/config');
var esConfig = config.elasticSearch;
var promise = require('bluebird');


function esQueryHelper(){
	this.client = new elasticsearch.Client({
		host: esConfig.url,
		requestTimeout : 1000 * 60 *5
		//,log: 'trace'
	});
}


esQueryHelper.prototype = {
	dispose:function(){
		this.client = null;
	},

	run:function(esQuery,indexName,indexType){
		return new promise(function(resolve){
			this.client.search({
			  index: indexName,
			  //type: indexType,
			  body: esQuery}).then(function (resp) {
			    					this.parseAggregrations(resp,resolve);
							  }.bind(this), function (err) {
				    				resolve({},err.message);
							  }.bind(this));
		}.bind(this));
	},

	createESQuery:function(searchTerms,aggFields,onlyAgg){
		var query = {
		};
		this.termQuery(searchTerms,query);
		this.termsAggQuery(aggFields,query);
		if(onlyAgg){
			query['size'] = 0;
		}
		return query;
	},
	termQuery:function(searchTerms,query){
		//var terms = {};
		if(searchTerms && searchTerms.length > 0){
			var q1 = {};
			q1['term'] = {};
			searchTerms.forEach(function(searchMap){
				q1['term'][searchMap.key] = searchMap.value;
			});
			query["query"] = q1;
		}
		//return terms;
	},
	termsAggQuery:function(fields,query){
		var aggs = {};
		if(fields && fields.length > 0){
			fields.forEach(function(fieldName){
				aggs[fieldName] = {
					"terms":{"field":fieldName,"size":0}
				}
			});
		}
		query['aggs'] = aggs;
	},

	parseAggregrations:function(result,callback){
		if(result.aggregations){
			callback(result.aggregations);
		}
		else{
			callback({});
		}
	},

	checkIndexReady:function(indexName,callback){
		this.client.cluster.health({
			'index':indexName,
			'waitForStatus':'yellow',
			'timeout':'50s'
		},function(resp,err){
			console.log(resp,err);
			callback();
		});
	}
}


module.exports = esQueryHelper;
