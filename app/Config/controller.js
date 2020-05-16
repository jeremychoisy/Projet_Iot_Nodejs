const mongoose = require('mongoose');

const Config = mongoose.model('Config');

exports.getZones = async (req, res) => {
    try {
        const zones = (await Config.findOne({})).zones;
        res.status(200).json({
            zones: zones
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

exports.addZone = async (req, res) => {
    try {
        const zones = (await Config.updateOne({}, {$push: {zones: req.body}}, {new: true})).zones;
        res.status(200).json({
            zones: zones
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};
