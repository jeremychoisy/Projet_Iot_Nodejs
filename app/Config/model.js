const mongoose = require('mongoose');

const zone = new mongoose.Schema({
    number: {type: String},
    APs: {type: [String]},
});

const ConfigSchema = new mongoose.Schema({
    timeLimit: {type: Number},
    zones : {type: [zone]},
    allowedNbOfZones: {type: Number}
});

module.exports = mongoose.model('Config', ConfigSchema);
