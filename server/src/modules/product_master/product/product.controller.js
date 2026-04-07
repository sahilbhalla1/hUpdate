const service = require('./product.service');
 
// CREATE
exports.create = async (req, res, next) => {
  try {
    const { customer_model_id, product_code } = req.body;
 
    if (!customer_model_id || !product_code) {
      return res.status(400).json({
        success: false,
        message: 'customer_model_id and product_code are required'
      });
    }
 
    const id = await service.create({ customer_model_id, product_code });
 
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
};
 

 
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { product_code, status } = req.body;

    // Validation: at least one field required
    if (product_code === undefined && status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'product_code or status is required'
      });
    }

    // Validate status if provided
    if (status !== undefined && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await service.update(id, { product_code, status });

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (err) {
    next(err);
  }
};

// GET ALL (by customer_model_id)
exports.getAll = async (req, res, next) => {
  try {
    const { customer_model_id } = req.query;
 
    if (!customer_model_id) {
      return res.status(400).json({
        success: false,
        message: 'customer_model_id is required'
      });
    }
 
    const data = await service.getAll(customer_model_id);
 
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};