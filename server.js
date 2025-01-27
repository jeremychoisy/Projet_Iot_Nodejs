// Importation des modules
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Bootstrap models
require('./app/AccessPoint/model');
require('./app/Config/model');
require('./app/Fleet/model');
require('./app/Flight/model');
require('./app/Ping/model');
require('./app/Position/model');


const mqttHelpers = require('./helpers/mqtt');

// Topics
global.TOPIC_AP = 'POSITION/ACCESS-POINTS';
global.TOPIC_PING_REQUEST = 'PING/REQUEST';
global.TOPIC_PING_ANSWER = 'PING/ANSWER';

// express
const express = require('express');
const bodyParser = require('body-parser');

const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(morgan("dev"));
server.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "*");
    response.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
});
// Url
const address = process.env.NODE_ENV === 'production' ? 'localhost' : '54.93.113.62';

// MongoDB
const mongoDBName = 'IOT_Project';
const mongoDBURL = 'mongodb://iot_server:RRxnS#ren4T@' + address + ':27017/' + mongoDBName;

// Make Mongoose use `findOneAndUpdate()`.
mongoose.set('useFindAndModify', false);

// Connection a la DB MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(mongoDBURL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Connection to database established!")
    }).catch(err => {
    console.log("Connection to database failed, the server will shut down : " + err);
    process.exit();
});

//  MQTT server
const mqtt_url = 'http://' + address + ':1883';
global.Client_mqtt = mqtt.connect(mqtt_url);

// Subscriptions
Client_mqtt.on('connect', () => {
    Client_mqtt.subscribe(TOPIC_PING_ANSWER, (err) => {
        if (err)
            console.error(err);
        else
            console.log('Subscribed to ', TOPIC_PING_ANSWER);
    });
    Client_mqtt.subscribe(TOPIC_AP, (err) => {
        if (err)
            console.error(err);
        else
            console.log('Subscribed to ', TOPIC_AP);
    });
});


// Callback triggered when MQTT messages are caught
Client_mqtt.on('message', mqttHelpers.mqttCallBack);

// Disconnect from MongoDB server when process ends
process.on('exit', () => {
    if (mongoose && mongoose.connection.readyState === 1) {
        console.log('Mongodb connection is going to be closed !');
        mongoose.connection.close();
    }
});

require("./app") (server);

server.use((req,res)=> {
    res.sendStatus(404);
});

// Le server est accessible sur le port 5000
server.listen(5000, () => {
    console.log('Server listening on port 5000...');
});
