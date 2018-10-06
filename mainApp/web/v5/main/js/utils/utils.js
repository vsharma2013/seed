(function(NS){
	var messages = NS.messages;
	var utils = {
		getHBUITemplate:function(tempName,callback){
			var path = '/temp/' + tempName + '?seed='+ new Date();
			$.get(path,function(data){
				console.log(typeof data)
				if(typeof data == "object"){
					this.handleSessionExpireError(data);
				}
				else{
					var source   = data;
					var template = Handlebars.compile(source);
	    			callback(template);
	    		}
			}.bind(this));
		},

		getRequest:function(url,callback){
			$.get(url,function(resp){
				if(resp.status == 200){
					callback(resp.data);
				}
				else{
					this.handleSessionExpireError(resp);
					callback(null);
				}
			}.bind(this));
		},

		postRequest:function(url,body,callback){
			var success = function(resp){
				if(resp.status == 200){
					callback(resp.data);
				}
				else{
					this.handleSessionExpireError(resp);
					callback(false);
				}
			}.bind(this)

			$.ajax({
			  type: "POST",
			  url: url,
			  data: body,
			  success: success,
			  dataType: 'json'
			});
		},

		putRequest:function(url,body,callback){
			var success = function (resp){
				if(resp.status == 200){
					callback(true);
				}
				else{
					this.handleSessionExpireError(resp);
					callback(false);
				}
			}.bind(this)

			$.ajax({
			  type: "PUT",
			  url: url,
			  data: body,
			  success: success,
			  dataType: 'json'
			});
		},

		deleteRequest:function(url,body,callback){
			var success = function (resp){
				if(resp.status == 200){
					callback(true);
				}
				else{
					this.handleSessionExpireError(resp);
					callback(false);
				}
			}.bind(this);

			$.ajax({
			  type: "DELETE",
			  url: url,
			  data: (body?body:{}),
			  success: success,
			  dataType: 'json'
			});

		},

		handleSessionExpireError:function(resp){
			if(resp.status == 0){
				var message = resp.message;
				this.showAlertMessage('SESSION_EXPIRED',function(){
					window.location.replace("/login/login.html");
				});
			}
		},


		getDefaultColors :function(){
			var d3Colors = d3.scale.category10().range();
			var myColors =  ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#2b908f"];
			return d3Colors.concat(myColors);
		},
		 /**
		 * Generates a GUID string.
		 * @returns {String} The generated GUID.
		 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
		 * @author Slavik Meltser (slavik@meltser.info).
		 * @link http://slavik.meltser.info/?p=142
		 */
		getUUId:function(){
		    var ALPHABET = '23456789abdegjkmnpqrvwxyz';
			var ID_LENGTH = 4;

			var generate = function() {
			  var rtn = '';
			  for (var i = 0; i < ID_LENGTH; i++) {
			    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
			  }
			  return rtn;
			}

			return generate();
		},

		showMessage:function(code,var1){
			var messageObj = messages[code];
			var type = messageObj.type;
			var text = messageObj.text;
			text = this.modifyMessage(text,var1);
			showMessage(text,type);
		},

		modifyMessage:function(text,var1){
			text = text.replace(new RegExp('#VAR1#', 'g'), var1);
			return text;
		},

		showAlertMessage:function(code,closeCallback,var1){
			var messageObj = messages[code];
			var type = messageObj.type;
			var text = messageObj.text;
			text = this.modifyMessage(text,var1);
			showAlertMessage(text,type,closeCallback);
		},

		isNonEmptyStr : function(str){
			return _.isString(str) && /([^\s])/.test(str);
		},

		getAllIndicesOfSubStr : function (strSrc, strTarget){
			var idxs = utils.getAllIndicesOfSubStringMatches(strSrc, strTarget);
			idxs = _.filter(idxs, function(idx){
				var tstr = strTarget.substr(idx, strSrc.length + 1).trim();
				return tstr === strSrc;
			});
			return idxs;
		},

		getAllIndicesOfSubStringMatches : function (strSrc, strTarget, idxs){
			var idx = strTarget.indexOf(strSrc);
			if(idx === -1)
				return _.isEmpty(idxs) ? [] : idxs;
			else{
				if(!idxs)
					idxs = [];
				var offset = _.last(idxs) ? _.last(idxs) + strSrc.length : 0;
				idxs.push(offset + idx);
				var s = idx + strSrc.length;
				var e = strTarget.length;
				return utils.getAllIndicesOfSubStringMatches(strSrc, strTarget.substr(s,e), idxs);		
			}
		}
	}

	function showAlertMessage(text,type,closeCallback){
		var id = 'message-box-' + type;
		var box = $('#' + id);
		
        if(box.length > 0){
        	box.find('.mb-content p').text(text);
        	box.find('.mb-control-close').unbind('click').bind('click',function(){
        		$(this).unbind('click');
        		$(this).parents(".message-box").removeClass("open");
        		closeCallback();
        	});
            box.toggleClass("open");
        }        
	}

	function showMessage(text,type){
		var n = noty({
			text: text,
			layout: 'topRight',
			dismissQueue: true,
			type:type,
			animation: {
		        open: 'animated fadeInDown', // or Animate.css class names like: 'animated bounceInLeft'
		        close: 'animated fadeOutRight', // or Animate.css class names like: 'animated bounceOutLeft'
		        easing: 'swing',
		        speed: 500 // opening & closing animation speed
		    }
		});
		setTimeout(function(){
			n.close();
		},4000);
	};

	NS.utils = utils;
})(window);