// Importation des modules
const path = require('path');
const mqtt = require('mqtt');
const mongodb = require('mongodb');

// Topics
const TOPIC_LIGHT = 'sensors/light';
const TOPIC_TEMP  = 'sensors/temp';
const TOPIC_JOIN = 'fleet/join';
const TOPIC_QUIT = 'fleet/quit';
const TOPIC_PING_REQUEST = 'fleet/ping-request';
const TOPIC_PING_ANSWER = 'fleet/ping-answer';

// express
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/UI/')));
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "*");
    response.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
});
// Url
const address = process.env.NODE_ENV === 'production' ? 'localhost' : '54.93.113.62';

// MongoDB
const mongoDBName = 'TP3_IOT';
const mongoDBURL = 'mongodb://jeremychoisy_user:iot@' + address + ':27017/TP3_IOT';

const client = new mongodb.MongoClient(mongoDBURL, {useNewUrlParser: true, useUnifiedTopology: true});

// Connection a la DB MongoDB
client.connect((err,  mongodbClient) => {
    if(err) throw err;

    // Get a connection to the DB "TP3_IOT" or create it
    const dbo = client.db(mongoDBName);

    dbo.collection('temp').deleteMany({}, (err, delOK) => {
        if (err) throw err;
        console.log('Temperature collection cleared');
    });

    dbo.collection('light').deleteMany({}, (err, delOK) => {
        if (err) throw err;
        console.log("Light collection cleared");
    });

    dbo.collection('ping').deleteMany({}, (err, delOK) => {
        if (err) throw err;
        console.log("Pings collection cleared");
    });

    // dbo.collection('fleet').deleteMany({}, (err, delOK) => {
    //     if (err) throw err;
    //     console.log("fleet collection cleared");
    // });

    // Remote MQTT server
    const mqtt_url = 'http://' + address + ':1883';
    const client_mqtt = mqtt.connect(mqtt_url);


    // Subscription
    client_mqtt.on('connect', () => {
        client_mqtt.subscribe(TOPIC_LIGHT,  (err) => {
            if (err) throw err;
            console.log('Subscribed to ', TOPIC_LIGHT);
        });

        client_mqtt.subscribe(TOPIC_TEMP, (err) => {
            if (err) throw err;
            console.log('Subscribed to ', TOPIC_TEMP);
        });

        client_mqtt.subscribe(TOPIC_JOIN, (err) => {
            if (err) throw err;
            console.log('Subscribed to ', TOPIC_JOIN);
        });

        client_mqtt.subscribe(TOPIC_QUIT, (err) => {
            if (err) throw err;
            console.log('Subscribed to ', TOPIC_QUIT);
        })

        client_mqtt.subscribe(TOPIC_PING_ANSWER, (err) => {
            if (err) throw err;
            console.log('Subscribed to ', TOPIC_QUIT);
        })
    });


    // Callback triggered when MQTT messages are caught
    client_mqtt.on('message', async (topic, message) => {
        try {
            console.log("MQTT msg on topic : ", topic.toString());
            console.log("Msg payload : ", message.toString());
            const fleet = await dbo.collection('fleet').find({}).toArray();
            // We stock the topic name in the key
            const key = path.parse(topic.toString()).base;

            // Parsing
            message = JSON.parse(message.toString());
            const who = message.who;

            if (fleet.findIndex((object) => object.who === who) > -1 || key === 'join') {
                const payload = message.value !== undefined ? message.value : message.description || message.id;

                if (key === 'ping-answer') {
                    console.log(payload);
                    dbo.collection('ping').updateOne({_id: mongodb.ObjectId(payload)}, {$set: {status: 'success'}},  (err, res) => {
                        if (err) throw err;
                        if (res.modifiedCount){
                            console.log("Ping update to success for : " + payload);
                        }
                    });
                } else {
                    // Date format to be compatible with '2020-01-01'
                    const frTime = new Date().toLocaleString("sv-SE", {timeZone: "Europe/Paris"});
                    const new_entry = {
                        date: frTime,
                        who: who,
                        payload
                    };
                    const coll = key === 'join' ? 'fleet' : key;
                    const filter = key === 'join' ? {who: new_entry.who} : {...new_entry};
                    dbo.collection(coll).updateOne(filter, {$set: {...new_entry}}, {upsert: true}, function (err, res) {
                        if (err) throw err;
                        if (res.upsertedCount) {
                            console.log(new_entry);
                            console.log("Inserted in DB in collection :", coll);
                        } else {
                            console.log("Not inserted : duplicate")
                        }
                    });
                }
            } else if (key === 'quit') {
                dbo.collection('fleet').removeOne({who: who}, (err, ok) => {
                    if (err) throw err;
                    console.log(who + ' successfully removed from the fleet of objects.');
                });
            } else {
                console.log("Object is not part of the fleet.")
            }

            // Debug
            // console.log("WhoList using the node server :", fleet);
            // dbo.listCollections().toArray(function (err, collInfos) {
            //     if (err) throw err;
            //     console.log("List of collections currently in DB: ", collInfos);
            // });
        } catch(err) {
            console.error(err);
        }
    });

    // Disconnect from MongoDB server when process ends
    process.on('exit', () => {
        if (mongodbClient && mongodbClient.isConnected()) {
            console.log('Mongodb connection is going to be closed !');
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
    app.get('/esp/:what',  (req, res) => {
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

        dbo.collection(key).find({who:who}).sort({date:-1}).limit(nb).toArray((err, result) => {
            if (err) throw err;
            console.log('get on ', key);
            console.log(result);
            res.json(result.reverse()); // This is the response.
            console.log('end find');
        });
        console.log('end app.get');
    });

    app.get('/esp',  (req, res) => {
        console.log(req.originalUrl);
        console.log("--------------------------------");
        console.log("A client/navigator ", req.ip);
        console.log("sending URL ",  req.originalUrl);
        console.log("wants to GET the list of objects in the fleet");

        dbo.collection('fleet').find({}).toArray((err, result) => {
            if (err) throw err;
            console.log('list of objects in the fleet : ', result);
            res.json(result); // This is the response.
            console.log('end find');
        });
        console.log('end app.get');
    });

    app.post('/ping',  (req, res) => {
        try {
            console.log(req.originalUrl);
            console.log("--------------------------------");
            console.log("A client/navigator ", req.ip);
            console.log("sending URL ", req.originalUrl);
            console.log("wants to ping one of the objects in the fleet");

            const who = req.body.who;

            dbo.collection('ping').insertOne({who: who, status: 'isPending'}, (err, result) => {
                if (err) throw err;
                const _id = result.ops[0]._id;
                console.log('Esp pinged : ', result.ops[0].who);
                client_mqtt.publish(TOPIC_PING_REQUEST, JSON.stringify({who: who, id: _id}));
                res.json({id : _id});
                console.log('end insertOne');
            });
            console.log('end app.post');
        } catch (err) {
            console.log(err.toString());
        }
    });

    app.get('/ping',  (req, res) => {
        try {
            const id = req.query.id;
            console.log(req.originalUrl);
            console.log("--------------------------------");
            console.log("A client/navigator ", req.ip);
            console.log("sending URL ", req.originalUrl);
            console.log("wants to GET the ping status for: " + id);

            dbo.collection('ping').find({_id: mongodb.ObjectId(id)}).toArray((err, result) => {
                if (err) throw err;
                res.json(result[0]);
                console.log('end find');
            });
            console.log('end app.get');
        } catch (err) {
            console.log(err.toString())
        }
    });
});// end of MongoClient.connect


// L'application est accessible sur le port 3000
app.listen(3000, () => {
    console.log('Server listening on port 3000...');
});
