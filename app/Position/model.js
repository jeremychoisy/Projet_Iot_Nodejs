const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now},
    idClient : {type: mongoose.Schema.Types.ObjectId, ref: 'Fleet'},
    zone: {type: Number, required:true},
});

module.exports = mongoose.model('Position', PositionSchema);
