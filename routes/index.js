const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');
const ErrorHandler = require('../middleware/error.middleware');
const AuthGuard = require('../middleware/auth.middleware');
const schema = require('../validatons/auth.validation');
const validate = require('../utils/validator.util'); 
const constantsRoutes = require('./contents.route');

router.post('/um/register', validate(schema.register), ErrorHandler(AuthController.register));
router.post('/um/sendEmailVerificationOtp', validate(schema.sendEmailVerificationOtp), ErrorHandler(AuthController.sendEmailVerificationOtp));
router.post('/um/login',    validate(schema.login),    ErrorHandler(AuthController.login));
router.get('/um/user',      AuthGuard,                 ErrorHandler(AuthController.getUser));
router.get('/um/logout',    AuthGuard,                 ErrorHandler(AuthController.logout));
router.post('/um/refreshToken',    validate(schema.refreshToken),           ErrorHandler(AuthController.refreshToken));
router.use("/getConstants", constantsRoutes);

router.all('*',  (req, res) => res.status(400).json({ message: 'Bad Request.'}))

module.exports = router;
