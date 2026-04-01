const express = require('express');
const router = express.Router();
const subCatecontroller = require('./subcategory.controller');
 
// CREATE
router.post('/create-sub', subCatecontroller.create);
 
router.put('/:id', subCatecontroller.update);
 
// GET ALL (by category_id)
router.get('/get-sub', subCatecontroller.getAll);
 
module.exports = router;