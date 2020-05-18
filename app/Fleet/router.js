const controller = require('./controller');
const express = require('express');
const router = express.Router();

/*
 GET routes
 */
router.get('/get', controller.getFleetList);

/*
 POST routes
 */
router.post('/add', controller.addToFleet);
router.post('/delete', controller.removeFromFleet);

module.exports = router;
