const express = require('express');
const router = express.Router();
const modelSpecContro = require('./modelSpec.controller');
 
// CREATE
router.post('/create-modspec', modelSpecContro.create);
 

router.put('/:id', modelSpecContro.update);


// GET ALL (by sub_category_id)
router.get('/get-modspec', modelSpecContro.getAll);
 
module.exports = router;