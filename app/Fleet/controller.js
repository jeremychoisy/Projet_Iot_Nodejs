const mongoose = require('mongoose');

const Fleet = mongoose.model('Fleet');

exports.getFleetList = async (req, res) => {
    try {
        const fleet = await Fleet.find({});
        res.status(200).json({
            fleet: fleet
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

exports.addToFleet = async (req, res) => {
    try {
        await Fleet.create(req.body);
        const fleet = await Fleet.find();
        res.status(200).json({
            fleet: fleet
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

exports.removeFromFleet = async (req, res) => {
    try {
        const ret = await Fleet.deleteOne({macAddress: req.body.macAddress});
        const fleet = await Fleet.find();
        if (ret.deletedCount) {
            res.status(200).json({
                fleet: fleet
            });
        } else {
            res.status(500).json({
                message: "Failed to delete this object from the fleet."
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};
