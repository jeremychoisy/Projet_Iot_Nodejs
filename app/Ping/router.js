const controller = require('./controller');
const express = require('express');
const router = express.Router();

/*
 GET routes
 */
router.get('/get', controller.getPing);

/*
 POST routes
 */
router.post('/publish', controller.publishPing);

module.exports = router;
