const mongoose = require('mongoose');

/*
 Access point model
 */
const AccessPointSchema = new mongoose.Schema({
    name : {type: String, required:true},
    latitude: {type: Number, required:true},
    longitude: {type: Number, required:true},
});

module.exports = mongoose.model('AccessPoint', AccessPointSchema);
