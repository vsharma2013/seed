(function(NS){
	var serviceRouter = NS.serviceRouter;
	var suggestionBldr = NS.suggestionBuilder;
	var utils = NS.utils;

	var querySuggestor = (function(){
		var fileIdVsDataSet = {};
		var activeFileId = null;
		var $input = null;
		var $suggestionContainer = $('.suggestions-container');
		var $suggestion = $('.suggestion');
		
		var privateFn = {			
			init : function(dataSet, viewOptions){
				$input = $('.dummySearchTextCtrl');
				$input.unbind('focus').bind('focus', this.onFocusOnSearchInput.bind(this));
				$input.unbind('focusout').bind('focusout', this.onFocusOutSearchInput.bind(this));
				this.addSuggestionHoverEvents();
				viewOptions.getSearchString = function() { return $input.val();}
				viewOptions.fileId = activeFileId;
				suggestionBuilder.init(dataSet, viewOptions)
			},

			onFocusOnSearchInput : function(e){
				var pos = this.getAbsPosition(document.getElementsByClassName('dummySearchTextCtrl')[0]);
				$suggestionContainer.css('top', (pos[0]+30) + 'px');
				$suggestionContainer.css('left', pos[1] + 'px');
				this.updateSuggestions();
				$suggestionContainer.css('visibility', 'visible');
			},

			onFocusOutSearchInput : function(e){
				$suggestionContainer.css('visibility', 'hidden');

				var selSuggestion = $('.suggestion.select').text();
				if(!utils.isNonEmptyStr(selSuggestion)) return;
				if(selSuggestion === $input.val()) return;

				$input.val(selSuggestion);
			},
			
			onSearchInputKeyPress : function(e){
				if(e.keyCode === 38 || e.keyCode === 40)
					return this.updateSelectionInSuggestionList(e);
				if(e.keyCode === 13 || e.keyCode === 27)
					return this.onFocusOutSearchInput(e);

				setTimeout(function(){
					$suggestionContainer.css('visibility', 'visible');
					this.updateSuggestions(e.keyCode);
				}.bind(this), 2);
			},

			updateSuggestions : function(keyCode){
				suggestionBuilder.getSuggestions(keyCode, this.renderSuggestions.bind(this));
			},

			renderSuggestions : function(suggestions){
				$suggestion.removeClass('select');
				$suggestion.each(function(idx){
					var val = suggestions[idx] ? suggestions[idx] : '';
					$(this).text(val);					
				});
			},

			updateSelectionInSuggestionList : function(e){
				var $sel = $('.suggestion.select');
				if(!$sel.length){
					$suggestion.first().addClass('select');
					$input.val($suggestion.first().text());
					return;
				}
				var $next = e.keyCode === 40 ? $sel.next() : $sel.prev();
				$sel.removeClass('select');
				$next.addClass('select');
				$input.val($next.text());
			},

			getAbsPosition : function(el){
			    var el2 = el;
			    var curtop = 0;
			    var curleft = 0;
			    if (document.getElementById || document.all) {
			        do  {
			            curleft += el.offsetLeft-el.scrollLeft;
			            curtop += el.offsetTop-el.scrollTop;
			            el = el.offsetParent;
			            el2 = el2.parentNode;
			            while (el2 != el) {
			                curleft -= el2.scrollLeft;
			                curtop -= el2.scrollTop;
			                el2 = el2.parentNode;
			            }
			        } while (el.offsetParent);

			    } else if (document.layers) {
			        curtop += el.y;
			        curleft += el.x;
			    }
			    return [curtop, curleft];
			},

			addSuggestionHoverEvents : function(){
				function onHoverOver(){
					$(this).addClass('select');
				}

				function onHoverOut(){
					$(this).removeClass('select');
				}
				$suggestion.hover(onHoverOver, onHoverOut);
			}
		};

		this.init = function(fileId, viewOptions){;
			activeFileId = fileId;
			var dataSet = fileIdVsDataSet[fileId];
			if(!dataSet){
				serviceRouter.getQuerySuggestionsData(fileId, function(data){
					fileIdVsDataSet[fileId] = data;
					privateFn.init(data, viewOptions);
				});
			}
			else{
				privateFn.init(dataSet, viewOptions);
			}
		}

		this.handleKeyPress = function(e){
			privateFn.onSearchInputKeyPress(e);
		}
	});

	NS.querySuggestor = new querySuggestor();
})(window);