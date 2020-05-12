const controller = require('./controller');
const express = require('express');
const router = express.Router();

router.get('/get-by-mac-address', controller.getByMacAddress);

module.exports = router;
