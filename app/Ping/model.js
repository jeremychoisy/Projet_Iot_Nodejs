const mongoose = require('mongoose');

const PingSchema = new mongoose.Schema({
    macAddress : {type: String, required:true},
    status: {type: String, enum: ['inactive','pending','completed', 'failed'], default: 'inactive'},
});

module.exports = mongoose.model('Ping', PingSchema);
