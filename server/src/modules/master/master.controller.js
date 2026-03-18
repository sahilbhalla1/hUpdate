const masterService = require("./master.service");

async function fetchCategories(req, res) {
  try {
    const data = await masterService.getCategories();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function fetchSubCategories(req, res) {
  try {
    const { categoryId } = req.params;
    const data = await masterService.getSubCategories(categoryId);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function fetchModelSpecifications(req, res) {
  try {
    const { subCategoryId } = req.params;
    const data = await masterService.getModelSpecifications(subCategoryId);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function fetchCustomerModels(req, res) {
  try {
    const { modelSpecId } = req.params;
    const data = await masterService.getCustomerModels(modelSpecId);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function fetchProductIds(req, res) {
  try {
    const { customerModelId } = req.params;
    const data = await masterService.getProductIds(customerModelId);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  fetchCategories,
  fetchSubCategories,
  fetchModelSpecifications,
  fetchCustomerModels,
  fetchProductIds
};
