const controller = require('./controller');
const express = require('express');
const router = express.Router();

router.get('/get-by-client-id', controller.getPositionsByClientId);
router.get('/get-last-by-client-id', controller.getLastPositionByClientId);

module.exports = router;
