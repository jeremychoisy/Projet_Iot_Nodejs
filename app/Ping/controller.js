const mongoose = require('mongoose');

const Ping = mongoose.model('Ping');

exports.publishPing = async (req, res) => {
    try {
        const macAddress = req.body.macAddress;
        const ping = new Ping({macAddress: macAddress, status: 'pending'});
        await ping.save();
        Client_mqtt.publish(TOPIC_PING_REQUEST, JSON.stringify({macAddress: macAddress, id: ping._id}));
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
