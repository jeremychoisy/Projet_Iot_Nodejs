const controller = require('./controller');
const express = require('express');
const router = express.Router();

router.get('/get-by-client-id', controller.getByClientId);

module.exports = router;
