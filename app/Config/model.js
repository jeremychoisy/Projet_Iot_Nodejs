const mongoose = require('mongoose');

const zone = new mongoose.Schema({
    number: {type: String},
    AP: {type: [String]},
});

const ConfigSchema = new mongoose.Schema({
    zones : {type: [zone]}
});

module.exports = mongoose.model('Config', ConfigSchema);
