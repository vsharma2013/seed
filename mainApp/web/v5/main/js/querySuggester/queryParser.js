(function(NS){
	var utils = NS.utils;
	function queryParser(qStr, restricted){
		var _restricted = _.isEmpty(restricted) ? [] : restricted;
		var _qStr = qStr;
		var regExp = new RegExp(/ in | by |avg of |count of |min of |max of |sum of |as |for |from |during /g);
		var _tokens = _qStr.match(regExp) || [];
		var _endsOnToken = false;
		var _endsOnKeyword = false;
		var _endsOnRestricted = false;
		
		var kws = _.isEmpty(_tokens) ? 
		          _qStr.split(' ').map(function(i) { return i.trim()}) :  
		          _qStr.split(regExp).map(function(i) { return i.trim()});
		
		var _kws = _.filter(kws, function(w) { return utils.isNonEmptyStr(w) && !_.contains(_restricted, w)});
		var _rws = _.filter(kws, function(w) { return utils.isNonEmptyStr(w) && _.contains(_restricted, w)});
		
		if(!_.isEmpty(_tokens)) _tokens =  _tokens.map(function(i) { return i.trim()});
		if(!_.isEmpty(_kws))    _kws    =  _kws.map(function(i) { return i.trim()});
		if(!_.isEmpty(_rws))    _rws    =  _rws.map(function(i) { return i.trim()});

		function setKeywords(kws){
			if(kws.length !== _kws.length) return;
			
			var tokensAndRestricted = _.uniq(_tokens.concat(_rws));
			var arr = [];
			_kws.forEach(function(w, i){
				var idxs = utils.getAllIndicesOfSubStr(w, _qStr);
				idxs.forEach(function(idx){
					arr.push({idx : idx, val : kws[i]})
				});
			});
			tokensAndRestricted.forEach(function(w){
				var idxs = utils.getAllIndicesOfSubStr(w, _qStr);
				idxs.forEach(function(idx){
					arr.push({idx : idx, val : w})
				});
			});
			arr = _.sortBy(arr, function(a) { return a.idx; });
			arr = _.pluck(arr, 'val');
			_qStr = arr.join(' ');
			_kws = kws.slice(0);
			var l = _.last(arr);
			_endsOnKeyword = _.last(_kws) === l;
			_endsOnToken = _.last(_tokens) === l;
			_endsOnRestricted = _.last(_rws) === l;
		}

		this.getKeywords = function(){ return _kws.slice(0);}
		this.setKeywords = setKeywords;
		this.getQueryString = function() { return _qStr; }
		this.endsOnKeyword = function() { return _endsOnKeyword; }
		this.endsOnToken  = function() { return _endsOnToken ; }
		this.endsOnRestricted = function() { return _endsOnRestricted; }
	}
	NS.queryParser = queryParser;
})(window);
