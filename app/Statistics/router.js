const controller = require('./controller');
const express = require('express');
const router = express.Router();

router.get('/get', controller.getStatisticsForZones);

module.exports = router;
