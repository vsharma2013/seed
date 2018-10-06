'use strict';

let _ = require('underscore');
let elasticsearch = require('elasticsearch');

let config = require('./../../config/config');
let qb = require('./../query-runner/ESQueryBuilder');
let cUtils = require('./../utils/commonUtils');
let hierarchyDb = require('./../mongoDB/hierarchyDB.js')
let mongoDb = require('./../mongoDB/mongoDB');
let QueryParser = require('./../query-parser/QueryParser');

function QueryMeta(){
	this.client = new elasticsearch.Client({
		host: config.elasticSearch.url,
		requestTimeout : 1000 * 60 *5,
		keepAlive:false
	});
}

QueryMeta.prototype.getQueryMetaData = function*(req){
	let fileId = req.params.fileId;
	let esQuery = new qb.matchAllQuery(fileId);
	esQuery.index = cUtils.getIndexNameForBusinessData(fileId);
	delete esQuery.type;

	let esDocs = yield this.client.search(esQuery);
	
	esQuery.size = esDocs.hits.total;
	
	esDocs = yield this.client.search(esQuery);

	let masterData = esDocs.hits.hits.map(h => { return {name : h._source.name, type : h._source.type} });
	
	let mDocs1 = yield hierarchyDb.getHierarchyDoc(fileId);
	
	let hierarchy = Array.isArray(mDocs1) && mDocs1.length > 0 ? mDocs1[0].heararchy : {};

	let mDocs2 = yield mongoDb.findDocuments({id : fileId}, config.mongoConfig.dataSetCollectionName);
	
	let headers = Array.isArray(mDocs2) && mDocs2.length > 0 ? mDocs2[0].headers : {};

	return {
		masterData : masterData,
		hierarchy : hierarchy,
		headers : headers
	}
}

QueryMeta.prototype.getQuerySuggestions = function*(req){
	let sQuery = new Buffer(req.params.q, 'base64').toString();
	let query = JSON.parse(sQuery);
	if(_.isEmpty(query.aggs)) return [];
	
	let size = 1;//parseInt(20/query.aggs.length);
	let esQuery = new qb.MatchAllMultiAndWithAggsQuery(req.params.fileId);
	
	_.keys(query.q).map(k => esQuery.addFilter(k, query.q[k]))
	query.aggs.map(a => esQuery.addAggregator(a, size));

	let esDocs = yield this.client.search(esQuery.toESQuery());
	let aggs = esDocs.aggregations;
	if(_.isEmpty(aggs)) return [];

	let buckets = [];
	for(let key in aggs){
		let agg = aggs[key];
		if(!_.isEmpty(agg.buckets)){
			buckets = buckets.concat(agg.buckets);
		}
	}
	buckets = _.sortBy(buckets, function(b) { return -b.doc_count; });
	return _.pluck(buckets, 'key');
}

let gQryMeta = new QueryMeta();


module.exports = {
	getQueryMetaData : gQryMeta.getQueryMetaData.bind(gQryMeta),
	getQuerySuggestions : gQryMeta.getQuerySuggestions.bind(gQryMeta)
}
