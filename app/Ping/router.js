const controller = require('./controller');
const express = require('express');
const router = express.Router();

router.get('/get', controller.getPing);

router.post('/publish', controller.publishPing);

module.exports = router;
