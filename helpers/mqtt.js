const mongoose = require('mongoose');

const Fleet = mongoose.model('Fleet');
const Ping = mongoose.model('Ping');
const Position = mongoose.model('Position');

exports.mqttCallBack = async (topic, message) => {
    try {
        const fleet = await Fleet.find({});
        // We stock the topic name in the key
        const key = path.parse(topic.toString()).base;

        // Parsing
        message = JSON.parse(message.toString());
        const macAddress = message.macAddress;

        if (fleet.findIndex((object) => object.macAddress === macAddress) > -1) {

            if (key === 'ping-answer') {
                const res = await Ping.updateOne({_id: mongoose.Types.ObjectId(message.id)}, {$set: {status: 'success'}});
                if (res.modifiedCount) {
                    console.log("Ping updated successfully  : " + message.id);
                } else {
                    console.error("Failed to update ping : "  + message.id)
                }
            } else if (key === 'position') {
                // Date format to be compatible with '2020-01-01'
                const frTime = new Date().toLocaleString("sv-SE", {timeZone: "Europe/Paris"});
                const position = {
                    date: frTime,
                    macAddress: macAddress,
                    zone: getZone()
                };
                const res = await Position.create(position);
                if (res.insertedCount) {
                    console.log("Position inserted successfully : " + position);
                } else {
                    console.error("Failed to insert position : "  + position)
                }

            }
        } else {
            console.error("Object is not part of the fleet.")
        }
    } catch (err) {
        console.error(err);
    }
};

// TODO: zone or actual position ?
const getZone = () => '2';
