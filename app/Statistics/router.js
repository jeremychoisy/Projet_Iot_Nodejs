const controller = require('./controller');
const express = require('express');
const router = express.Router();

/*
 GET routes
 */
router.get('/get', controller.getStatisticsForZones);

module.exports = router;
