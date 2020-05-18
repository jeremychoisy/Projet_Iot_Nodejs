const mongoose = require('mongoose');

const Position = mongoose.model('Position');

/*
 Get all the positions for a given client
 */
exports.getPositionsByClientId = async (req, res) => {
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

/*
 Get the last (current?) position for a given client
 */
exports.getLastPositionByClientId = async (req, res) => {
    try {
        const positions = await Position
            .find({clientId: req.query.id})
            .sort({date: -1});
        if (positions.length) {
            res.status(200).json({
                position: positions[0]
            });
        } else {
            res.status(404).json({
                message: 'No positions found for this client.'
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

