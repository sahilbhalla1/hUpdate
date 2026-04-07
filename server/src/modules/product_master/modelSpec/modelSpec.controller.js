const service = require('./modelSpec.service');
 
// CREATE
exports.create = async (req, res, next) => {
  try {
    const { sub_category_id, spec_value } = req.body;
 
    if (!sub_category_id || !spec_value) {
      return res.status(400).json({
        success: false,
        message: 'sub_category_id and spec_value are required'
      });
    }
 
    const id = await service.create({ sub_category_id, spec_value });
 
    res.status(201).json({
      success: true,
      message: 'Model specification created successfully',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
};
 


exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { spec_value, status } = req.body;

    // ❌ nothing sent
    if (spec_value === undefined && status === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (spec_value or status) is required"
      });
    }

    // ✅ validate status if present
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    await service.update(id, { spec_value, status });

    res.json({
      success: true,
      message: "Model specification updated successfully"
    });

  } catch (err) {
    next(err);
  }
};


 
// GET ALL (by sub_category_id)
exports.getAll = async (req, res, next) => {
  try {
    const { sub_category_id } = req.query;
 
    if (!sub_category_id) {
      return res.status(400).json({
        success: false,
        message: 'sub_category_id is required'
      });
    }
 
    const data = await service.getAll(sub_category_id);
 
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};