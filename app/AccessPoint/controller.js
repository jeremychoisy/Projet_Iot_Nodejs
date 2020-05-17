const mongoose = require('mongoose');

const AP = mongoose.model('AccessPoint');

exports.addAP = async (req, res) => {
    try {
        await AP.create(req.body);
        const APs = await AP.find();
        res.status(200).json({
            APs: APs
        });
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

exports.deleteAP = async (req, res) => {
    try {
        const ret = await AP.deleteOne({_id: mongoose.Types.ObjectId(req.body.id)});
        if (ret.deletedCount) {
            const APs = await AP.find();
            res.status(200).json({
                APs: APs
            });
        } else {
            res.status(500).json({
                message: "AP could not be removed from the the list."
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.toString()
        });
    }
};

exports.getAP = async (req, res) => {
    try {
        const APs = await AP.find();
        res.status(200).json({
            APs: APs
        });
    } catch (err) {
        console.log(err.toString())
    }
};
