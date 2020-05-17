const mongoose = require('mongoose');

const Ping = mongoose.model('Ping');
const Fleet = mongoose.model('Fleet');

exports.publishPing = async (req, res) => {
    try {
        const object = await Fleet.findById(req.body.id);
        const ping = await Ping.create({clientId: object._id, status: 'pending', type: req.body.type});
        Client_mqtt.publish(TOPIC_PING_REQUEST, JSON.stringify({macAddress: object.macAddress, id: ping._id, type: req.body.type}));
        res.status(200).json({
            ping: ping
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

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
