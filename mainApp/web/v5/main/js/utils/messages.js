(function(NS){
	var messages = {
		'NO_DASHBOARDS':{
				'text': 'Item cannot be pinned. Please add dashboard from dashboards tab.',
				'type':'warning'
		},
		'DATASET_ADDED':{
				'text': 'DataSet "#VAR1#" added successfully. Please click dataset to upload file.',
				'type':'success'
		},
		'DATASET_UPLOADED':{
			'text':'File "#VAR1#" uploaded successfully. Please Process the file.',
			'type':'success'
		},

		'DATASET_PROCESSING_START':{
			'text':'Dataset processing will take few minutes.Please wait... ',
			'type':'information'
		},

		'DATASET_PROCESSING_COMPLETE':{
			'text':'Dataset "#VAR1#" processing completed successfully. Start generating dashboard from dataset.',
			'type':'success'
		},

		'DATASET_REMOVED':{
			'text':'Dataset "#VAR1#" deleted successfully.',
			'type':'success'
		},
		'NO_PANEL_DASHBOARD':{
			'text':"No Panels on dashboard. Please pin panels on dashboard by searching on datasets.",
			'type':'warning'
		},
		"SESSION_EXPIRED":{
			'text':'Session Expired. Please login.',
			'type':'error'
		},
		"LOGOUT_SUCCESS":{
			'text':"Logout Successfull.",
			'type':'success'
		},
		"SEARCH_ERROR_KEYWORDS":{
			'text':'Keyswords "#VAR1#" are not reconizable. Please check spelling or try another keywords.',
			'type':'warning'
		},
		"COMPARE_DRILLDOWN_DISABLE":{
			'text':'Drill down is not yet enabled for compare queries.',
			'type':'information'
		},
		"INVALID_SHARED_USER":{
			'text':'Username "#VAR1#" is invalid.',
			'type':'warning'
		},
		"DUPLICATE_SHARED_USER":{
			'text':'Dashboard already shared with user "#VAR1#".',
			'type':'warning'
		},
		"PANEL_UNPIN_SUCCESS":{
			'text':'Panel unpinned successfully.',
			'type':'success'
		},
		"PANEL_VALIDATION":{
			'text':'Panel title cannot be empty. Please enter a valid title.',
			'type':'warning'
		},
		"DATASET_HIERARCHY_SAVED":{
			'text':'Changes to the hierarchy are saved.',
			'type':'success'
		},
		"HIERARCHY_LINE_CUT":{
			'text':'Line Item "#VAR1#" cut successfully.',
			'type':'success'
		},
		"HIERARCHY_LINE_COPY":{
			'text':'Line Item "#VAR1#" copied successfully.',
			'type':'success'
		},
		"HIERARCHY_LINE_PASTE":{
			'text':'Line Item "#VAR1#" pasted successfully.',
			'type':'success'
		},
		"PARENT_SAME_AS_CHILD":{
			'text':'Child cannot be added to itself.',
			'type':'warning'
		},
		"CHILD_ALREADY_EXIT":{
			'text':'Child already exist for the parent.',
			'type':'warning'
		},
		"CHILD_ALREADY_PARENT":{
			'text':'Child is already one of parent of selected node.',
			'type':'warning'
		},
		"DATASET_UPLOADED_FAIL":{
			'text':'File header names cannot contain dots (i.e. .) and must not start with a dollar sign (i.e. $). Please edit the file and upload again.',
			'type':'error'
		}
	}
	NS.messages = messages;
})(window);
