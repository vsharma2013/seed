(function(NS,routie){
	var utils = NS.utils;
	var serviceRouter = NS.serviceRouter;

	var dashboardCrudView = (function(){
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var container = null;
			var addedUsers = [];
			var removedUsers = {};

			var privateFn = {
				renderView:function(){
					this.getTemplate();
				},
				getTemplate:function(){
					utils.getHBUITemplate('dashboardCrudTmpl.hbs',this.addTemplateToUI.bind(this))
				},

				addTemplateToUI:function(hbTemplate){
					var sharedUsers = viewModel.sharedUsers;
					var usernames = '';
					if(sharedUsers){
						sharedUsers.forEach(function(user){
							usernames += user.username + ',';
						});
					}
					$(document.body).append(hbTemplate({model:viewModel,usernames:usernames}));
					this.bindModelEvents();
					this.showModel();
				},

				showModel:function(){
					container.modal('show');
				},

				handleShareUserTags:function(){
					$('.dummyShareUserInput').css({'width':'100%'});
					setTimeout(function(){
						var width = $('.dummyShareUserInput').width();
						$('.dummyShareUserInput').tagsInput({
							width: width + 'px',
							height:'100px',
							defaultText: "Add User",
							'onAddTag':this.onSharedUserAdd.bind(this),
						    'onRemoveTag':this.onRemoveSharedUser.bind(this),
							'minChars' : 0,
						    'placeholderColor' : '#666666',
						    'interactive':true
						});
					}.bind(this),250);
				},

				validateDuplicateShared:function(val){
					var isValid = true;
					var sharedUsers = viewModel.sharedUsers;
					if(removedUsers[val]){
						return true;
					}
					if(sharedUsers){
						sharedUsers.forEach(function(user){
							if(user.username == val){
								isValid = false;
							}
						})
					}

					if(addedUsers){
						addedUsers.forEach(function(user){
							if(user.username == val){
								isValid = false;
							}
						})
					}
					return isValid;
				},

				onSharedUserAdd:function(val){
					if(!this.validateDuplicateShared(val)){
						$('.dummyShareUserInput').removeTag(val);
						utils.showMessage("DUPLICATE_SHARED_USER",val);
						return;
					}

					serviceRouter.validateUser(val,function(data){
						if(data.isValid == 0){
							$('.dummyShareUserInput').removeTag(val);
							utils.showMessage("INVALID_SHARED_USER",val);
							//$('.dummyShareUserInput').focus();
						}
						else{
							if(removedUsers[val]){
								delete removedUsers[val];
							}
							addedUsers.push({username:val,userId:data.userId});
						}
					});
				},

				onRemoveSharedUser:function(val){
					removedUsers[val] = 1;
				},

				bindModelEvents:function(){
					container = $('#dashboardCrudModel');
					container.off('show.bs.modal').on('show.bs.modal',this.onModelShow.bind(this));
					container.off('hide.bs.modal').on('hide.bs.modal',this.onModelHide.bind(this));
				},

				bindUIEvents:function(){
					$('.dummySaveDashboardData').unbind('click').bind('click',function(){
						setTimeout(function(){
							this.onModelSave()
						}.bind(this),20);
					}.bind(this));
				},

				onModelSave:function(){
					var name = $('.dummyDashboardName').val();
					var description = $('.dummyDashboardDescription').val();
					viewModel.name = name;
					viewModel.description = description;

					if(addedUsers && addedUsers.length > 0){
						if(!viewModel.sharedUsers){
							viewModel.sharedUsers = [];
						}
						viewModel.sharedUsers = viewModel.sharedUsers.concat(addedUsers);
					}

					if(removedUsers){
						var keys = Object.keys(removedUsers);
						if(keys && keys.length > 0){
							var sharedUsers = viewModel.sharedUsers;
							if(sharedUsers){
								for(var i=0;i<sharedUsers.length;i++){
									var user = sharedUsers[i];
									if(removedUsers[user.username]){
										sharedUsers.splice(i,1);
										i--;
									}
								}
							}
						}
					}

					if(viewOptions.isAdded){
						viewOptions.onDataAdd(viewModel)
					}
					else{
						viewOptions.onDataSave(viewModel);
					}
					container.modal('hide');
				},

				onModelShow:function(){
					this.bindUIEvents();
					this.handleShareUserTags();
				},

				onModelHide:function(){
					viewOptions.onModeClose(viewModel);
					this.destroy();
				},

				destroy:function(){
					viewModel = null;
					container.remove();
				}
			}

			this.render = function(){
				privateFn.renderView();
			}

			this.destroy = function(){
				privateFn.destroy();
			}
		};
		return view;
	})();

	NS.dashboardCrudView = dashboardCrudView;
})(window,routie);