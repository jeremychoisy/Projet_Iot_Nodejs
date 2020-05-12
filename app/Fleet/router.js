const controller = require('./controller');
const express = require('express');
const router = express.Router();

router.get('/get', controller.getFleetList);

router.post('/add', controller.addToFleet);
router.post('/delete', controller.removeFromFleet);

module.exports = router;
