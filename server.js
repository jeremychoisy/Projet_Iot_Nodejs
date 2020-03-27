// Importation des modules
const path = require('path');
const mqtt = require('mqtt');
const mongodb = require('mongodb');

// Topics
const TOPIC_LIGHT = 'sensors/light';
const TOPIC_TEMP  = 'sensors/temp';

// express
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "*");
    response.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
});
// Url
// const address = '54.93.113.62';
const address = 'localhost';
// MongoDB
const mongoDBName = 'TP3_IOT';
const mongoDBURL = 'mongodb://jeremychoisy_user:iot@' + address + ':27017/TP3_IOT';

const client = new mongodb.MongoClient(mongoDBURL, {useNewUrlParser: true, useUnifiedTopology: true});

// Connection a la DB MongoDB
client.connect((err,  mongodbClient) => {
    if(err) throw err;

    // Get a connection to the DB "TP3_IOT" or create it
    const dbo = client.db(mongoDBName);

    dbo.collection('temp').deleteMany({}, function(err, delOK) {
        if (err) throw err;
        if (delOK) console.log('Temperature collection cleared');
    });

    dbo.collection('light').deleteMany({}, function(err, delOK) {
        if (err) throw err;
        if (delOK) console.log("Light collection cleared");
    });

    // Remote MQTT server
    const mqtt_url = 'http://' + address + ':1883';
    const client_mqtt = mqtt.connect(mqtt_url);


    // Subscription
    client_mqtt.on('connect', () => {
        client_mqtt.subscribe(TOPIC_LIGHT,  (err) => {
            if (!err) {
                //client_mqtt.publish(TOPIC_LIGHT, 'Hello mqtt')
                console.log('Node Server has subscribed to ', TOPIC_LIGHT);
            }
        });
        client_mqtt.subscribe(TOPIC_TEMP, (err) => {
            if (!err) {
                //client_mqtt.publish(TOPIC_TEMP, 'Hello mqtt')
                console.log('Node Server has subscribed to ', TOPIC_TEMP);
            }
        })
    });


    // Callback triggered when MQTT messages are caught
    client_mqtt.on('message', function (topic, message) {
        console.log("MQTT msg on topic : ", topic.toString());
        console.log("Msg payload : ", message.toString());

        // Parsing
        message = JSON.parse(message.toString());
        const who = message.who;
        const val = message.value;

        // Debug
        const whoList = [];
        const index = whoList.findIndex(x => x.who === who);
        if (index === -1){
            whoList.push({who: who});
        }
        console.log("whoList using the node server :", whoList);

        // Date format to be compatible with '2020-01-01'
        const frTime = new Date().toLocaleString("sv-SE", {timeZone: "Europe/Paris"});
        const new_entry = {
            date: frTime,
            who: who,
            value: val
        };

        // We stock the topic name in the key
        const key = path.parse(topic.toString()).base;
        dbo.collection(key).insertOne(new_entry, function(err, res) {
            if (err) throw err;
            console.log("Item inserted in db in collection :", key);
            console.log(new_entry);
        });

        // Debug
        dbo.listCollections().toArray(function(err, collInfos) {
            // collInfos is an array of collection info objects that look like:
            // { name: 'test', options: {} }
            console.log("\nList of collections currently in DB: ", collInfos);
        });
    });

    // Disconnect from MongoDB server when process ends
    process.on('exit', () => {
        if (mongodbClient && mongodbClient.isConnected()) {
            console.log('mongodb connection is going to be closed ! ');
            mongodbClient.close();
        }
    });

    //================================================================
    //==== REQUETES HTTP reconnues par le Node =======================
    //================================================================

    // Accés par le Node a la page HTML affichant les charts
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '/UI/ui_TP3_IOT.html'));
    });

    // Function for answering GET request on this node server ...
    // probably from navigator.
    // The request contains the name of the targeted ESP !
    //     /esp/temp?who=80%3A7D%3A3A%3AFD%3AC9%3A44
    // Utilisation de routes dynamiques => meme fonction pour
    // /esp/temp et /esp/light
    app.get('/esp/:what', function (req, res) {
        // cf https://stackabuse.com/get-query-strings-and-parameters-in-express-js/
        console.log(req.originalUrl);

        const who = req.query.who; // get the "who" param from GET request
                           // => gives the Id of the ESP we look for in the db
        const what = req.params.what; // get the "what" from the GET request : temp or light ?

        console.log("\n--------------------------------");
        console.log("A client/navigator ", req.ip);
        console.log("sending URL ",  req.originalUrl);
        console.log("wants to GET ", what);
        console.log("values from object ", who);

        const nb = 200; // Récupération des nb derniers samples
                        // stockés dans la collection associée a ce
                        // topic (wa) et a cet ESP (wh)
        const key = what;
        //dbo.collection(key).find({who:wh}).toArray(function(err,result) {
        dbo.collection(key).find({who:who}).sort({_id:-1}).limit(nb).toArray(function(err, result) {
            if (err) throw err;
            console.log('get on ', key);
            console.log(result);
            res.json(result.reverse()); // This is the response.
            console.log('end find');
        });
        console.log('end app.get');
    });

});// end of MongoClient.connect


// L'application est accessible sur le port 3000
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
