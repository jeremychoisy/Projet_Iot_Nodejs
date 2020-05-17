const mongoose = require('mongoose');

const Fleet = mongoose.model('Fleet');
const Ping = mongoose.model('Ping');
const Position = mongoose.model('Position');
const Config = mongoose.model('Config');
const Flight = mongoose.model('Flight');

exports.mqttCallBack = async (topic, message) => {
    try {
        const fleet = await Fleet.find({});
        // We stock the topic name in the key
        const key = path.parse(topic.toString()).base;

        // Parsing
        message = JSON.parse(message.toString());

        // mac address
        const macAddress = message.macAddress;

        // Index in the fleet
        const fleetIndex = fleet.findIndex((object) => object.macAddress === macAddress);

        if (fleetIndex > -1) {
            if (key === 'ping-answer') {
                const res = await Ping.updateOne({_id: mongoose.Types.ObjectId(message.id)}, {$set: {status: 'success'}});
                if (res.modifiedCount) {
                    console.log("Ping updated successfully  : " + message.id);
                } else {
                    console.error("Failed to update ping : "  + message.id)
                }
            } else if (key === 'position') {
                const client = fleet[fleetIndex];
                const config = await Config.findOne({});
                const zone = getZone(message.APs, config);

                if (zone >= 0) {
                    const now = new Date();
                    // Check the departure time of the next flight using the flight number associated to the client
                    const flight = await Flight.findOne({flightNumber: client.flightNumber});
                    const departureTime = flight.departureDate;

                    if (await isWithinTheTimeLimit(now, departureTime, config)) {
                        if (flight.zone - zone > config.allowedNbOfZones) {
                            await publishPing(macAddress, 'timeLimit-run')
                        } else {
                            await publishPing(macAddress, 'timeLimit-walk')
                        }
                    }

                    const position = {
                        date: now.toLocaleString("sv-SE", {timeZone: "Europe/Paris"}),
                        clientId: client._id,
                        zone: getZone(message.APs)
                    };

                    const res = await Position.create(position);
                    if (res.insertedCount) {
                        console.log("Position inserted successfully : " + position);
                    } else {
                        console.error("Failed to insert position : " + position)
                    }
                } else {
                    console.error("Could not find any valid zone.")
                }
            }
        } else {
            console.error("Object is not part of the fleet.")
        }
    } catch (err) {
        console.error(err);
    }
};

const getZone = async (APs, config) => {
    const sortedAPs = APs.sort();
    const {zones} = config;
    const associatedZone = zones.find((zone) => JSON.stringify(zone.APs.sort()) === JSON.stringify(sortedAPs));
    return associatedZone ? associatedZone.number : -1;
};

const isWithinTheTimeLimit = async (now, departureDate, config) => {
    const {timeLimit} = config;
    return (new Date(departureDate).getTime() - now.getTime()) > timeLimit * 60000;
};

const publishPing = async (macAddress, type) => {
    const ping = new Ping({macAddress: macAddress, type, status: 'pending'});
    await ping.save();
    Client_mqtt.publish(TOPIC_PING_REQUEST, JSON.stringify({macAddress: macAddress, id: ping._id, type}));
};
