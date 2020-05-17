const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
    flightNumber : {type: String},
    departureDate : {type: String},
    zone : {type: Number},
});

module.exports = mongoose.model('Flight', FlightSchema);
