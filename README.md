# Projet IOT Nodejs

This is a first version of a nodejs server handling a fleet of objects and an UI.

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
- Modify ```UI/scripts/chart.js``` :
```
const node_url = 'http://54.93.113.62:3000';
```
By
```
const node_url = ''http://localhost:3000';
```
- install all the modules :
```
npm i
```
- Start the server :
```
node server.js
```
NB: you'll be using the mongoDB server and the MQTT server already deployed at 54.93.113.62.
#### Deploy on a remote machine
- install your mongoDB and MQTT servers
- Modify ```UI/scripts/chart.js``` :
```
const node_url = 'http://54.93.113.62:3000';
```
By
```
const node_url = 'http://your_server_ip_address:3000';
```
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
pm2 start ecosystem.config.js
```
- Check that everything is running smoothly :
```
pm2 list
```
