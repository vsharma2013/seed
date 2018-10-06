function PostProcessAggregator(operator){
	this.operator = operator;
};

PostProcessAggregator.prototype.addPostProcessAggregation  = function(agg,numberDomain){
	if(!this.operator || this.operator.toLowerCase() == 'count'){
		return;
	}
	
	if(!agg) return;
	if(!agg.aggs) return;
	
	if(Object.keys(agg.aggs).length === 0) return;
	
	var root = agg.aggs;
	var numberDomainField = null;
	if(numberDomain && numberDomain.length > 0){
		numberDomainField = numberDomain[0].values?numberDomain[0].values[0]:null;
	}

	if(numberDomainField){
		Object.keys(root).forEach((function(k){
			var t = this.getOperatorAggregate(numberDomainField);

			if(t){
				var tKey = Object.keys(t)[0];
				
				if(root[k].aggs)
					root[k].aggs[tKey] = t[tKey];
			}
		}).bind(this));
	}
};

PostProcessAggregator.prototype.getOperatorAggregate = function(numberField){
	var operation = {};
	operation[this.operator] = {"field":numberField+'_mod'};
	/*operation["filter"] = {
		"exists" : { "field" : numberField+'_mod' }
	};*/
	var aggs = {};
	aggs["operator"] = operation;
	return aggs;
};

module.exports = PostProcessAggregator;