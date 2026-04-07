const express = require('express');
const router = express.Router();
const custModCont= require('./customerModel.controller');
 
// CREATE
router.post('/create-cm', custModCont.create);
 
// UPDATE
router.put('/:id', custModCont.update);
 
// GET ALL (by model_spec_id)
router.get('/get-cm', custModCont.getAll);
 
module.exports = router;