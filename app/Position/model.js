const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now},
    clientId : {type: mongoose.Schema.Types.ObjectId, ref: 'Fleet', required: true},
    zone: {type: Number, required:true},
});

module.exports = mongoose.model('Position', PositionSchema);
