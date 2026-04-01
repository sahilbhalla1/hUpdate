const express = require('express');
const router = express.Router();
const controller = require('./product.controller');
 
// CREATE
router.post('/create-prod', controller.create);
 
router.put('/:id', controller.update);

// GET ALL (by customer_model_id)
router.get('/get-prod', controller.getAll);
 
module.exports = router;