export JAVA_HOME=/root/softwares/java/jdk1.7.0_79

pkill -f mongod
pkill -f Elasticsearch
pkill -f Rserve
#pkill -f node

sleep 10

/root/softwares/mongo/mongodb-3.2.1/bin/mongod --dbpath /root/softwares/mongo/mongodb-3.2.1/data/db > /root/seed_logs/mongo.log &
/root/softwares/es/elasticsearch-1.7.4/bin/elasticsearch -d

cd /root/src/git/salesapp/mainApp
R CMD Rserve --no-save --silent --RS-conf Rserv.conf > /root/seed_logs/Rserve.log
#R --silent -f /root/src/git/salesapp/mainApp/scripts/rServe.conf > /root/seed_logs/Rserve.log
#. ~/.nvm/nvm.sh 
#nvm use node

#cd /root/src/git/salesapp/mainApp
#/root/.nvm/versions/node/v4.3.1/bin/node server.js > /root/seed_log/node.log &

#forever stop seed
#forever start ./forever/development.json
