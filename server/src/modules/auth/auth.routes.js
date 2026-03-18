const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/auth');

// public
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/dialer-login', authController.dialerLogin);

// protected
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
