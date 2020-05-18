const mongoose = require('mongoose');

const Fleet = mongoose.model('Fleet');

/*
 Get all the objects from the Fleet collection
 */
exports.getFleetList = async (req, res) => {
    try {
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

/*
 Add an object to the Fleet collection
 */
exports.addToFleet = async (req, res) => {
    try {
        // Remove any already existing fleet member using the same object
        await Fleet.deleteMany({macAddress: req.body.macAddress});

        // Add the new fleet member
        await Fleet.create(req.body);

        // Fetch the updated list
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

/*
 Remove an object from the Fleet collection
 */
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
