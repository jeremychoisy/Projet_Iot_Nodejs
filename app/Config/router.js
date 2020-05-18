const controller = require('./controller');
const express = require('express');
const router = express.Router();

/*
 GET routes
 */
router.get('/get-zones', controller.getZones);

/*
 POST routes
 */
router.post('/add-zone', controller.addZone);

module.exports = router;
