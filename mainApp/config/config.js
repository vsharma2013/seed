var config = {
	logger : {
		logDir : __dirname + '/../server/log/',
		logFileName : __dirname + '/../server/log/app.log'
	},
	elasticSearch : {
		url : 'http://localhost:9200/',
		salesIndex : 'companysales',
		salesType : 'sales'
	},
	typeEnum:{
		'STRING':1,
		'NUMBER':2,
		'DATE':3,
		'NOTYPE':4
	},
	dateFormats:[
		'MM/DD/YYYY',
		'DD/MM/YYYY',
		'YYYY/MM/DD',
		'YYYY/DD/MM',
		'DD-MMM-YYYY',
		'DD-MMM-YY',
		'DD-MM-YYYY',
		'DD-MM-YY',
		'MM-DD-YYYY',
		'MM-DD-YY',
		'MMM-YY',
		'MMMM Do YYYY',
		'MMMM Do YYYY,'
	],
	timeFormats:[
		'HH:MM',
		'HH',
		'HH:MM:SS',
		'h:mm:ss a',
		'h:mm:ss Z ZZ (Z)'
	],
	searchContext : {
		category : 1,
		category_in_region : 2,
		category_in_state : 3,
		category_in_city : 4,
		type : 5,
		type_in_region : 6,
		type_in_state : 7,
		type_in_city : 8,
		brand : 9,
		brand_in_region : 10,
		brand_in_state : 11,
		brand_in_city : 12,
		model : 13,
		model_in_region : 14,
		model_in_state : 15,
		model_in_city : 16,
		region : 17,
		state : 18,
		city : 19,
		type_in_brand : 20
	},
	saleStrategy : {
		strategyFileName : __dirname + '/../web/v1/sales.txt'
	},
	rConfig : {
		forecastFilePath : __dirname + '/../server/outliers/Forecast.R'
	},
	uploadFolder: __dirname + '/../data',
	mongoConfig:{
		'projectUrl':'mongodb://localhost:27017/seed',
		'hierarchyCollectionName':'filehierarchy',
		'userCollectionName':'seeduserdata',
		'dataSetCollectionName':'userDataSetCollection',
		'dashboardCollectionName':'userDashboardCollection',
		'queriesCollectionName':'userQueriesCollection',
		'tempCollectionName':'dataSetsDataTempCollection',
		'dashboardShareCollectionName':'dashboardShareCollection'
	},
	env:"dev" // When doing development
	//env:"prod"
};

config.port = config.env == 'prod' ? 80 : 9090;

module.exports = config;
