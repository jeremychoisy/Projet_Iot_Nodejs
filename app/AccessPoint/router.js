const controller = require('./controller');
const express = require('express');
const router = express.Router();

router.get('/get', controller.getAP);

router.post('/add', controller.addAP);
router.post('/delete', controller.deleteAP);

module.exports = router;
