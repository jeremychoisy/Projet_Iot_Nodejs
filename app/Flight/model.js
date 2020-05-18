const mongoose = require('mongoose');

/*
 Flight model
 */
const FlightSchema = new mongoose.Schema({
    flightNumber : {type: String},
    departureDate : {type: Date, default: Date.now()},
    zone : {type: Number},
});

module.exports = mongoose.model('Flight', FlightSchema);
