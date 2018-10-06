(function(NS,routie){
	var utils = NS.utils;
	var serviceRouter = NS.serviceRouter;

	var dataSetCrudView = (function(){
		var view = function(model,options){
			var viewModel = model;
			var viewOptions = options;
			var container = null;

			var privateFn = {
				renderView:function(){
					this.getTemplate();
				},
				getTemplate:function(){
					utils.getHBUITemplate('dataSetCrudTmpl.hbs',this.addTemplateToUI.bind(this))
				},

				addTemplateToUI:function(hbTemplate){
					$(document.body).append(hbTemplate(viewModel));
					this.bindModelEvents();
					this.showModel();
				},

				showModel:function(){
					container.modal('show');
				},

				bindModelEvents:function(){
					container = $('#fileUploadModel');
					container.off('show.bs.modal').on('show.bs.modal',this.onModelShow.bind(this));
					container.off('hide.bs.modal').on('hide.bs.modal',this.onModelHide.bind(this));
				},

				bindUIEvents:function(){
					$('.dummyProcessFileButton').unbind('click').bind('click',this.handleSaveDataSet.bind(this));
					$('.dummyDataSetName').unbind('change').bind('change',this.handleDataSetNameChange.bind(this));
					$('.dummyDataSetDescription').unbind('change').bind('change',this.handleDescriptionChange.bind(this));
				},

				handleProcessData:function(){
					viewModel.state = dataSetState.PROCESSING;
					serviceRouter.processDataSet(viewModel,function(){
						utils.showMessage('DATASET_PROCESSING_START',viewModel.name);
						container.modal('hide');
					});
				},

				handleDataSetNameChange:function(){
					var name = $('.dummyDataSetName').val();
					viewModel.name = name;
				},

				handleDescriptionChange:function(){
					var description = $('.dummyDataSetDescription').val();
					viewModel.description = description;
				},

				handleSaveDataSet:function(){
					if(viewModel.state == dataSetState.UPLOADED){
						this.handleProcessData();
					}

					if(viewModel.state < dataSetState.UPLOADED){
						alert('Please uplaod the file');
					}
				},

				handleFileUpload:function(){
					$("#datasetFile").fileinput({
				        showPreview: false,
				        allowedFileExtensions: ["csv"],
				        maxFileCount:1,
				        elErrorContainer: "#errorBlock",
				        maxFileSize: 10000,
				        //initialCaption: "Upload Data csv file",
				        browseLabel:"Browse",
				        removeLabel:"Remove",
				        uploadLabel:"Upload",
				        showCaption:false,
				        //showRemove: false,
        				//showUpload: false,
				        //browseIcon:'<i class="li_cloud fs1"></i>',
				        uploadUrl: window.location.protocol + '//' + window.location.host + '/api/_ds/_upload/'+viewModel.id, // server upload action
				        uploadAsync: true,
				        initialCaption: "Upload DataSet file."
				    });

				     $('#datasetFile').on('fileuploaded', function(event, data, previewId, index) {
					      var form = data.form, files = data.files, extra = data.extra,
			        		response = data.response, reader = data.reader;
			        	  var fileDetails = response.data.fileDetails;
			        	  var headers = response.data.headers;
			        	  var isValidHeaders = response.data.isValidHeaders;
			        	  if(isValidHeaders){
				        	  viewModel.fileName = fileDetails.fileName;
				        	  viewModel.filePath = fileDetails.filePath;
				        	  viewModel.fileExt = fileDetails.fileExt;
				        	  viewModel.state= dataSetState.UPLOADED;
				        	  viewModel.headers = headers
				        	  $('.dummyFileUploadCont').hide();
				        	  $('.dummyFileSuccessCont').show();
				        	  $('.dummyFileNameText').text(viewModel.fileName);
				        	  utils.showMessage('DATASET_UPLOADED',viewModel.fileName);
				          }
				          else{
				          	  utils.showMessage('DATASET_UPLOADED_FAIL');
				          }
					}.bind(this));
				},

				onModelShow:function(){
					this.handleFileUpload();
					this.bindUIEvents();
				},

				onModelHide:function(){
					viewOptions.onModeClose(viewModel);
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

	NS.dataSetCrudView = dataSetCrudView;
})(window,routie);