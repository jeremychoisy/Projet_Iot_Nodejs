const mongoose = require('mongoose');

const Config = mongoose.model('Config');

/*
 Get all the zones from the document in the Config collection
 */
exports.getZones = async (req, res) => {
    try {
        const zones = await Config.findOne().populate({path: 'zones.APs'});
        res.status(200).json({
            zones: zones.zones
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

/*
 Add a zone to the document in the Config collection
 */
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
