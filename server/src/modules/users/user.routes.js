const express = require('express');
const router = express.Router();

const userController = require('./user.controller');
const authMiddleware = require('../../middleware/auth');

// all user routes are protected
router.use(authMiddleware);

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);

module.exports = router;
