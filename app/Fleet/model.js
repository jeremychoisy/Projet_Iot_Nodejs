const mongoose = require('mongoose');

const FleetSchema = new mongoose.Schema({
    macAddress : {type: String, required:true},
    flightNumber : {type: String, required:true},
    name : {type: String, required:true},
    LastName : {type: String, required:true},
});

module.exports = mongoose.model('Fleet', FleetSchema);
