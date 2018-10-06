(function(NS){
	var suggestionBuilder = function(){
		var allData = null;
		var allWords = [];
		var timeKeys = null;
		var viewOptions = null;
		var nWords = ['sum of', 'count of', 'avg of', 'min of', 'max of'];
		var hasNumbers = false;
		var srvcRouter = NS.serviceRouter;
		
		function init(dataSet, viewOptionsIn){
			allData = dataSet;
			viewOptions = viewOptionsIn;
			allData = dataSet;

			timeKeys = _.pluck(_.filter(allData.headers, function(h){
				return parseInt(h.type) === 3
			}), 'header');
			
			if(!timeKeys)
				timeKeys = [];
			allWords = _.pluck(allData.masterData, 'name');

			if(!allWords)
				allWords = [];

			hasNumbers = _.find(allData.headers, function(h) { return parseInt(h.type) === 2} ) ? true : false;
		}

		function getSuggestions(keyCode, cbOnDone){
			var qWords = getQuerySearchWords();
			if(!qWords) return cbOnDone(getDefaultSuggestions());

			if(qWords.length === 1 && keyCode !== 32) return cbOnDone(getSingleWordSuggestions(qWords[0]));

			if(keyCode === 32) return getProjectedSuggestionsForQueryWords(qWords, cbOnDone);

			cbOnDone(getSuggestionsForLastWord());
		}

		function getDefaultSuggestions(){
			var suggestions = [];
			var currQry = viewOptions.getSearchString();
			allData.headers.forEach(function(header){
				var mData = _.find(allData.masterData, function(md){
					return md.type === header.header;
				});
				if(mData && mData.name)
					suggestions.push(currQry + ' ' + mData.name);
			});
			return suggestions;
		}

		function getSuggestionWords(){
			var qryWords = getQuerySearchWords();
			if(!qryWords) return [];

			var data = allData.masterData;

			qryWords.forEach(function(qw){
				data = filterDataForSearchWord(qw, data);
			}.bind(this));

			var words = _.pluck(data, 'name');
			return words;
		}

		function filterDataForSearchWord(word, data){
			var mWord = getMatches(word, allWords)[0];
			var wordSrc = _.find(data, function(d){
				return d.name === mWord;
			});
			if(!wordSrc) return data;
			var type = wordSrc.type
			var removeKeys = getKeysToRemoveForType(type);
			var fData = _.filter(data, function(d){
				return !_.contains(removeKeys, d.type);
			});
			return fData;
		}

		function getQuerySearchWords(){
			var strSearch = viewOptions.getSearchString();
			if(!strSearch) return null;

			var qp = new NS.queryParser(strSearch, timeKeys);				
			var qWords = qp.getKeywords();
			var missing = [], found = [], lost = [];
			qWords.forEach(function(qw){
				var matches = getMatches(qw, allWords);
				_.isEmpty(matches) ? missing.push(qw) : found.push(matches[0]);
				
			});
			missing.forEach(function(mw){
				var arr = mw.split(' ');
				arr.forEach(function(aw){
					var matches = getMatches(aw.trim(), allWords);
					_.isEmpty(matches) ? lost.push(aw) : found.push(matches[0]);
				});
			});

			return _.isEmpty(found) ? null : found;
		}		

		function getSingleWordSuggestions(qWord){
			var qp = new queryParser(viewOptions.getSearchString(), timeKeys);
			var words = getMatches(qWord, allWords);
			var suggestions = [];
			words.forEach(function(w){
				qp.setKeywords([w]);
				suggestions.push(qp.getQueryString());
			});
			return suggestions;
		}

		function getMatches(srcWord, targetWordCollection, ignoreNum){
			if(_.isUndefined(ignoreNum)) ignoreNum = false;

			var matches, substringRegex;
		    matches = [];
		    substrRegex = new RegExp('^'+ srcWord, 'i');
		    $.each(targetWordCollection, function(i, str) {
		      if (substrRegex.test(str)) {
		        matches.push(str);
		      }
		    });
		    
		    if(hasNumbers && !ignoreNum){
		    	var nMatches = getMatches(srcWord, nWords, true);
		    	if(!_.isEmpty(nMatches)){
		    		nMatches.forEach(function(nm){
		    			matches.push(nm);
		    		});
		    	}
		    }
		    matches = _.sortBy(matches, function(m) {return m.length});
		    return matches;
		}

		function getProjectedSuggestionsForQueryWords(qWords, cbOnDone){
			var types = [], names = [], removeKeys = [];
			qWords.forEach(function(qw){
				var wordSrc = _.find(allData.masterData, function(d){
					return d.name === qw;
				});
				if(_.isEmpty(wordSrc)) return;

				var type = wordSrc.type;
				removeKeys.push(type);
				types.push(type);
				names.push(qw);
				removeKeys = removeKeys.concat(getKeysToRemoveForType(type));
			});
			var aggs = _.filter(Object.keys(allData.hierarchy), function(h){
				return !_.contains(removeKeys, h);
			});
			if(_.isEmpty(aggs)) return [];

			var q = {};
			for(var i = 0 ; i < types.length; i++){
				q[types[i]] = names[i];
			}
			var query = {
				q : q,
				aggs : aggs
			};
			srvcRouter.getQuerySuggestions(viewOptions.fileId, query, function(res){
				var suggestions = getSuggestionsForServerResponse(res, qWords);
				cbOnDone(suggestions);
			}.bind(this));
			return true;
		}

		function getSuggestionsForLastWord(){
			var qb = new queryParser(viewOptions.getSearchString(), timeKeys);
			var keyWords = qb.getKeywords();
			var lastWord = _.last(keyWords);
			var sWords = getMatches(lastWord, allWords);
			var suggestions = [];
			sWords.forEach(function(w){
				keyWords.pop();
				keyWords.push(w);
				qb.setKeywords(keyWords);
				var strSearch = qb.getQueryString();
				suggestions.push(strSearch);
				if(!_.contains(timeKeys, w)){
					timeKeys.forEach(function(tk){
						suggestions.push(strSearch + ' by ' + tk);
					});
				}
			});
			return suggestions;
		}

		function getSuggestionsForServerResponse(srvRes, qWords){
			if(_.isEmpty(srvRes)) return [];
			var qb = new queryParser(viewOptions.getSearchString(), timeKeys);
			qb.setKeywords(qWords);
			var strSearch = qb.getQueryString();;
			var suggestions = [];
			var sep_in = qb.endsOnToken() ? ' ' : ' in ';
			var sep_by = qb.endsOnRestricted() ? ' ' : ' by ';

			srvRes.forEach(function(w){
				suggestions.push(strSearch + sep_in+ w);
				if(!_.contains(timeKeys, w)){
					timeKeys.forEach(function(tk){
						suggestions.push(strSearch + sep_in + w + sep_by + tk);
					});
				}
			});
			return suggestions;
		}

		function getKeysToRemoveForType(type){
			var removeKeys = [type];
			var header = allData.hierarchy[type];
			removeKeys = removeKeys.concat(getParentKeysToRemove(header));
			removeKeys = removeKeys.concat(getChildKeysToRemove(header));
			return removeKeys;
		}

		function getParentKeysToRemove(current){
			if(_.isEmpty(current) || _.isEmpty(current.parents)){
				return [];
			}
			var keys = [];
			current.parents.forEach(function(pType){
				keys.push(pType);
				var parent = allData.hierarchy[pType];
				keys = keys.concat(getParentKeysToRemove(parent));
			});
			return keys;
		}

		function getChildKeysToRemove(current){
			if(_.isEmpty(current) || _.isEmpty(current.childs)) return [];
			
			var cKeys = _.keys(current.childs);
			if(_.isEmpty(cKeys)){
				return [];
			}
			var	keys = [];
			cKeys.forEach(function(key){
				keys.push(key);
				keys = keys.concat(getChildKeysToRemove(current.childs[key]));
			});
			return keys;
		}

		this.init = init;
		this.getSuggestions = getSuggestions;
	};
	NS.suggestionBuilder = new suggestionBuilder();
})(window);

//var s = 'cars in north for nokia in nokia5 with nokia88888 for nokia in nokia5 with nokia88888';
