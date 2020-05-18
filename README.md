# Projet IOT Nodejs

This is a first version of a nodejs server handling a fleet of objects for the [AirportConnect project](https://github.com/jeremychoisy/Projet_Iot_Ng).

### Prerequisites

**nodejs**

https://nodejs.org/en/download/

This is enough if you want to simply test the server on your local machine.

#### Otherwise, If you want to deploy the server on a remote machine, you'll need :

**pm2**
```
npm i pm2 -g
```

**mongoDB**

https://docs.mongodb.com/manual/installation/

**mosquitto**

https://mosquitto.org/download/

### Installing
#### Local Testing
- install all the modules :
```
npm i
```
- Start the server :
```
npm start
```
NB: you'll be using the mongoDB server and the MQTT server already deployed at 54.93.113.62.
#### Deploy on a remote machine
- install your mongoDB and MQTT servers

- Modify ```server.js``` :
```
const address = process.env.NODE_ENV === 'production' ? 'localhost' : '54.93.113.62';
```
By
```
const address = process.env.NODE_ENV === 'production' ? 'localhost' : 'your_server_ip_address';
```
And  ```mongoDBName``` / ```mongoDBURL``` with your mongoDB credentials.
- install all the modules :
```
npm i
```
- Launch the server with pm2 :
```
npm run pm2_start
```
- Check that everything is running smoothly :
```
pm2 list
```

### Documentation
#### Access points
Get all the access points from the AP collection
```
GET /access-point/get
```

Add an access point to the AP collection
```
POST /access-point/add
```
body :
```
{
    name : {type: String, required:true},
    latitude: {type: Number, required:true},
    longitude: {type: Number, required:true}
}
```
Remove an access point from the AP collection
```
POST /access-point/delete
```
body :
```
{
    id : {type: String, required:true}
}
```
#### Config
Get all the zones from the document in the Config collection
```
GET /config/get-zones
```

Add a zone to the document in the Config collection
```
POST /config/add-zone
```
body :
```
{
    number: {type: String},
    APs: [{type: mongoose.Schema.Types.ObjectId, ref: 'AccessPoint', required: true}]
}
```
#### Fleet
Get all the objects from the Fleet collection
```
GET /fleet/get
```

Add an object to the Fleet collection
```
POST /fleet/add
```
body :
```
{
    macAddress : {type: String, required:true},
    flightNumber : {type: String, required:true},
    firstName : {type: String, required:true},
    lastName : {type: String, required:true},
    wasTimeLimitWalkPinged: {type: Boolean, default:false},
    wasTimeLimitRunPinged: {type: Boolean, default:false}
}
```
Remove an object from the Fleet collection
```
POST /fleet/delete
```
body :
```
{
    macAddress : {type: String, required:true}
}
```
#### Pings
Get a ping from the Ping collection
```
GET /ping/get?id=pingId
```

Publish a ping on the MQTT server targeting a specific object and add a ping object to the Ping collection.

Update the ping status to failed if it is still pending after an amount of time defined in the config (default 15s)
```
POST /ping/publish
```
body :
```
{
    id : {type: mongoose.Schema.Types.ObjectId, ref: 'Fleet', required: true},
    type : {type: String, enum: ['timeLimit-walk', 'timeLimit-run','counter', 'emergency'], default: 'counter'}
}
```
#### Positions
Get all the positions for a given client
```
GET /position/get-by-client-id?id=clientId
```
Get the last (current?) position for a given client
```
GET /position/get-last-by-client-id?id=clientId
```
#### Statistics
Get the number of positions by zones
```
GET /statistics/get
```
