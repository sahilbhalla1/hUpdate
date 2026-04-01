const service = require('./customerModel.service');
 
// CREATE
exports.create = async (req, res, next) => {
  try {
    const { model_spec_id, model_number } = req.body;
 
    if (!model_spec_id || !model_number) {
      return res.status(400).json({
        success: false,
        message: 'model_spec_id and model_number are required'
      });
    }
 
    const id = await service.create({ model_spec_id, model_number });
 
    res.status(201).json({
      success: true,
      message: 'Customer model created successfully',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
};
 


exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { model_number, status } = req.body;

    // Nothing to update
    if (!model_number && !status) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required (model_number or status)'
      });
    }

    // Validate status if provided
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await service.update(id, { model_number, status });

    res.json({
      success: true,
      message: 'Customer model updated successfully'
    });
  } catch (err) {
    next(err);
  }
};
 
// GET ALL (by model_spec_id)
exports.getAll = async (req, res, next) => {
  try {
    const { model_spec_id } = req.query;
 
    if (!model_spec_id) {
      return res.status(400).json({
        success: false,
        message: 'model_spec_id is required'
      });
    }
 
    const data = await service.getAll(model_spec_id);
 
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};