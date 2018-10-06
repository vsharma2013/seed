# seed

## Installations

Need to be updated

## Configuring the App

### For Antlr: Use below grammer

1. Run elasticsearch : default port 9200
2. Run mongoDB: default port 27017
3. cd mainApp folder
4. antlr4 -Dlanguage=JavaScript server/query-parser/antlr/sales_rewrite.g4 -o ./generated
5. npm install
6. npm install forever -g
7. Running server
	* forever start ./forever/development.json
8. Stop server
	* forever stop seed

## Configuring the R
  1. Install Rserve : install.packages('Rserve');
  2. Install RSclient : install.packages('RSclient');

## Running R
  1. cd mainapp
  2. Start server: 
  		Rserve(args = "--no-save --RS-conf Rserv.conf")
  3. stop server:
		c <- RSconnect()
		RSshutdown(c)

## Running the app

| App  | url |
| ------------- | ------------- |
| Login URL  | http://localhost:9090/login/login.html   |
| APP URL  | http://localhost:9090/app/app.html  |
| Sales HTML  | http://localhost:9090/v1/sales.html  |


### Adding Login Details into the App:

post : http://localhost:9090/api/admin/user <br>
**Params:** username password <br>
**PostMan Request: x-www-form-urlencoded**






	

