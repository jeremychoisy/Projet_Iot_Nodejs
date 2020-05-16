const controller = require('./controller');
const express = require('express');
const router = express.Router();

router.get('/get-zones', controller.getZones);

router.post('/add-zone', controller.addZone);

module.exports = router;
