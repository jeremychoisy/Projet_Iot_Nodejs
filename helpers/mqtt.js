const mongoose = require('mongoose');
const path = require('path');

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

        // If object is part of the fleet
        if (fleetIndex > -1) {
            // If the message is an answer for a ping already sent
            if (key === 'ANSWER') {
                // Update the ping status to completed
                const res = await Ping.updateOne({_id: mongoose.Types.ObjectId(message.id)}, {$set: {status: 'completed'}});
                if (res.nModified) {
                    console.log("Ping updated successfully  : " + message.id);
                } else {
                    console.error("Failed to update ping : "  + message.id)
                }
            // If the message is APs data
            } else if (key === 'ACCESS-POINTS') {
                const client = fleet[fleetIndex];
                const config = await Config.findOne().populate({path: 'zones.APs'});
                // get the zone associated to the APs
                const zone = getZone(message.APs, config);
                // If a zone was found
                if (zone >= 0) {
                    const now = new Date();
                    // get the departure time of the next flight using the flight number associated to the client
                    const flight = await Flight.findOne({flightNumber: client.flightNumber});
                    const departureTime = flight.departureDate;
                    // Check if the time remaining is within the time limit
                    if (await isWithinTheTimeLimit(now, departureTime, config)) {
                        // Check the zone difference to determine if the ping should be run or walk
                        if (Math.abs(zone - flight.zone) > config.allowedNbOfZones) {
                            if (!client.wasTimeLimitRunPinged) {
                                await publishPing(client, 'timeLimit-run', config);
                                await Fleet.findByIdAndUpdate(client._id, {wasTimeLimitRunPinged: true});
                            }
                        } else {
                            if (!client.wasTimeLimitWalkPinged) {
                                await publishPing(client, 'timeLimit-walk', config);
                                await Fleet.findByIdAndUpdate(client._id, {wasTimeLimitWalkPinged: true});
                            }
                        }
                    }

                    // Create and add position the the Position collection
                    const position = {
                        clientId: client._id,
                        zone: zone
                    };
                    await Position.create(position);
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

/*
 Get zone from a list of APs
 */
const getZone = async (APs, config) => {
    const sortedAPs = APs.sort();
    const {zones} = config;
    const associatedZone = zones.find((zone) => JSON.stringify(zone.APs.map((AP) => AP.name).sort()) === JSON.stringify(sortedAPs));
    return associatedZone ? associatedZone.number : -1;
};

/*
 Whether the difference between now and the departure date time (both UTC format) is within the configured time limit
 */
const isWithinTheTimeLimit = async (now, departureDate, config) => {
    const {timeLimit} = config;
    const timeDiff = departureDate.getTime() - now.getTime();
    return timeDiff > 0 && departureDate.getTime() - now.getTime() < timeLimit * 60000;
};

/*
 Publish a ping on the MQTT server targeting a specific object with a specific type
 */
const publishPing = async (client, type, config) => {
    const ping = new Ping({clientId: client._id, type, status: 'pending'});
    await ping.save();
    Client_mqtt.publish(TOPIC_PING_REQUEST, JSON.stringify({macAddress: client.macAddress, id: ping._id, type}));
    // Update the ping status to failed if it is still pending after an amount of time defined in the config (default 15s)
    setTimeout(async () => {
        const fetchedPing = await Ping.findById(ping._id);
        if (fetchedPing.status !== 'completed') {
            await Ping.updateOne({_id: mongoose.Types.ObjectId(fetchedPing._id)}, {$set: {status: 'failed'}});
        }
    }, config.waitingTime)
};
