const mongoose = require('mongoose');

const Position = mongoose.model('Position');

exports.getByClientId = async (req, res) => {
    try {
        const positions = await Position
            .find({clientId: req.query.id})
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

