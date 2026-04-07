const service = require('./subcategory.service');
 
// CREATE
exports.create = async (req, res, next) => {
  try {
    const { category_id, name, code } = req.body;
 
    if (!category_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'category_id and name are required'
      });
    }
 
    const id = await service.create({ category_id, name, code });
 
    res.status(201).json({
      success: true,
      message: 'Sub category created successfully',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
};
 
// UPDATE
// exports.update = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { name, code } = req.body;
 
//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: 'name is required'
//       });
//     }
 
//     await service.update(id, { name, code });
 
//     res.json({
//       success: true,
//       message: 'Sub category updated successfully'
//     });
//   } catch (err) {
//     next(err);
//   }
// };
 
// // UPDATE STATUS (ACTIVATE / DEACTIVATE)
// exports.updateStatus = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
 
//     if (!['ACTIVE', 'INACTIVE'].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status'
//       });
//     }
 
//     await service.updateStatus(id, status);
 
//     res.json({
//       success: true,
//       message: `Sub category ${status.toLowerCase()} successfully`
//     });
//   } catch (err) {
//     next(err);
//   }
// };
 
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, status } = req.body;

    // Optional validations
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await service.update(id, { name, code, status });

    res.json({
      success: true,
      message: 'Sub category updated successfully'
    });

  } catch (err) {
    next(err);
  }
};


// GET ALL (by category)
exports.getAll = async (req, res, next) => {
  try {
    const { category_id } = req.query;
 
    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: 'category_id is required'
      });
    }
 
    const data = await service.getAll(category_id);
 
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};