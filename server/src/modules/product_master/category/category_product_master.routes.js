const express = require('express');
const router = require('express').Router();
const categoryController = require('./category_product_master.controller');
 
router.post('/create-category', categoryController.create);

router.put('/:id', categoryController.update);

router.get('/', categoryController.getAll);
 
module.exports = router;