const mongoose = require('mongoose');

const PingSchema = new mongoose.Schema({
    clientId : {type: mongoose.Schema.Types.ObjectId, ref: 'Fleet', required: true},
    status: {type: String, enum: ['inactive','pending','completed', 'failed'], default: 'inactive'},
    type: {type: String, enum: ['timeLimit-walk', 'timeLimit-run','counter', 'emergency'], default: 'counter'},
    date: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Ping', PingSchema);
