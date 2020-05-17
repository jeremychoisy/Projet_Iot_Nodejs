const mongoose = require('mongoose');

const FleetSchema = new mongoose.Schema({
    macAddress : {type: String, required:true},
    flightNumber : {type: String, required:true},
    firstName : {type: String, required:true},
    lastName : {type: String, required:true},
    wasTimeLimitWalkPinged: {type: Boolean, default:false},
    wasTimeLimitRunPinged: {type: Boolean, default:false}
});

module.exports = mongoose.model('Fleet', FleetSchema);
