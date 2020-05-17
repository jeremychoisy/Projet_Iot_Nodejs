const mongoose = require('mongoose');

const Position = mongoose.model('Position');

exports.getStatisticsForZones = async (req, res) => {
    try {
        const allPositions = await Position.find();
        const statistics = allPositions.reduce((acc, position) => {
            if (acc[position.zone]) {
                acc[position.zone] += 1;
            } else {
                acc[position.zone] = 1;
            }
            return acc;
        }, {});
        res.status(200).json({
            totalCount: allPositions.length,
            statistics
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};
