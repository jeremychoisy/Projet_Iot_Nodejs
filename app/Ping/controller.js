const mongoose = require('mongoose');

const Ping = mongoose.model('Ping');
const Fleet = mongoose.model('Fleet');
const Config = mongoose.model('Config');

/*
 Publish a ping on the MQTT server targeting a specific object and add a ping object to the Ping collection.
 Update the ping status to failed if it is still pending after an amount of time defined in the config (default 15s)
 */
exports.publishPing = async (req, res) => {
    try {
        const object = await Fleet.findById(req.body.id);
        const config = await Config.findOne();
        const ping = await Ping.create({clientId: object._id, status: 'pending', type: req.body.type});
        Client_mqtt.publish(TOPIC_PING_REQUEST, JSON.stringify({macAddress: object.macAddress, id: ping._id, type: req.body.type}));
        setTimeout(async () => {
            const fetchedPing = await Ping.findById(ping._id);
            if (fetchedPing.status !== 'completed') {
                await Ping.updateOne({_id: mongoose.Types.ObjectId(fetchedPing._id)}, {$set: {status: 'failed'}});
            }
        }, config.waitingTime);
        res.status(200).json({
            ping: ping
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

/*
 Get a ping from the Ping collection
 */
exports.getPing = async (req, res) => {
    try {
        const ping = await Ping.findOne({_id: mongoose.Types.ObjectId(req.query.id)});
        res.status(200).json({
            ping: ping
        });
    } catch (err) {
        console.log(err.toString())
    }
};
