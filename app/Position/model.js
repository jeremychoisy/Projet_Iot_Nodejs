const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now},
    macAddress : {type: String, required:true},
    zone: {type: String, required:true},
});

module.exports = mongoose.model('Position', PositionSchema);
