const mongoose = require('mongoose');

const zone = new mongoose.Schema({
    number: {type: String},
    APs: [{type: mongoose.Schema.Types.ObjectId, ref: 'AccessPoint', required: true}],
});

const ConfigSchema = new mongoose.Schema({
    timeLimit: {type: Number},
    zones : {type: [zone]},
    allowedNbOfZones: {type: Number}
});

module.exports = mongoose.model('Config', ConfigSchema);
