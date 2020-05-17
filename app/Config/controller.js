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
        const ret = await Config.findOneAndUpdate({}, {$push: {zones: req.body}});

        if(ret.nModified) {
            const zones = (await Config.findOne({})).zones;
            res.status(200).json({
                zones: zones
            });
        } else {
            res.status(500).json({
                message: "Zone could not be inserted to the configuration."
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};
