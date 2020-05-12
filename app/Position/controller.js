const mongoose = require('mongoose');

const Position = mongoose.model('Position');

exports.getByMacAddress = async (req, res) => {
    try {
        const positions = await Position
            .find({macAddress: req.query.macAddress})
            .sort({date: -1});
        res.status(200).json({
            positions: positions
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

