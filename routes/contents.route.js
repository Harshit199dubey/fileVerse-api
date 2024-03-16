const express = require('express');
const router = express.Router();

const contantsController = require('../controllers/contants.controller');
const ErrorHandler = require('../middleware/error.middleware');

router.get('/', ErrorHandler(contantsController.getConstants));



module.exports = router;