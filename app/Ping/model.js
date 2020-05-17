const mongoose = require('mongoose');

const PingSchema = new mongoose.Schema({
    macAddress : {type: String, required:true},
    status: {type: String, enum: ['inactive','pending','completed', 'failed'], default: 'inactive'},
    type: {type: String, enum: ['timeLimit-walk', 'timeLimit-run','counter', 'emergency'], default: 'counter'},
});

module.exports = mongoose.model('Ping', PingSchema);
