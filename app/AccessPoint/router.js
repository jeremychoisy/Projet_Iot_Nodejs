const controller = require('./controller');
const express = require('express');
const router = express.Router();

/*
 GET routes
 */
router.get('/get', controller.getAP);

/*
 POST routes
 */
router.post('/add', controller.addAP);
router.post('/delete', controller.deleteAP);

module.exports = router;
