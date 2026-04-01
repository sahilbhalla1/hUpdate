const service = require('./category_productmaster.service');
 
exports.create = async (req, res, next) => {
  try {
    const id = await service.create(req.body);
    res.json({ success: true, id });
  } catch (e) { next(e); }
};
 

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, status } = req.body;

    // Validation
    if (name === undefined && code === undefined && status === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name, code, status) is required"
      });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty"
      });
    }

    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    await service.update(id, { name, code, status });

    res.json({ success: true });

  } catch (e) {
    next(e);
  }
};
 
exports.getAll = async (req, res, next) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (e) { next(e); }
};