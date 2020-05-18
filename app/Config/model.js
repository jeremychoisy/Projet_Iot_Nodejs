const mongoose = require('mongoose');

/*
 Zone model
 */
const zone = new mongoose.Schema({
    number: {type: String},
    APs: [{type: mongoose.Schema.Types.ObjectId, ref: 'AccessPoint', required: true}],
});

/*
 Config model
 */
const ConfigSchema = new mongoose.Schema({
    timeLimit: {type: Number},
    zones : {type: [zone]},
    allowedNbOfZones: {type: Number},
    waitingTime: {type: Number}
});

module.exports = mongoose.model('Config', ConfigSchema);
