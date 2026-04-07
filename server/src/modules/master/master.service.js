const db = require("../../config/db");

// 1️⃣ Categories
async function getCategories() {
  const [rows] = await db.execute(
    `SELECT id, name,code
     FROM categories
     WHERE status = 'ACTIVE'
     ORDER BY name`
  );
  return rows;
}

// 2️⃣ Sub Categories
async function getSubCategories(categoryId) {
  const [rows] = await db.execute(
    `SELECT id, name
     FROM sub_categories
     WHERE category_id = ?
       AND status = 'ACTIVE'
     ORDER BY name`,
    [categoryId]
  );
  return rows;
}

// 3️⃣ Model Specifications
async function getModelSpecifications(subCategoryId) {
  const [rows] = await db.execute(
    `SELECT id, spec_value
     FROM model_specifications
     WHERE sub_category_id = ?
       AND status = 'ACTIVE'
     ORDER BY spec_value`,
    [subCategoryId]
  );
  return rows;
}

// 4️⃣ Customer Models
async function getCustomerModels(modelSpecId) {
  const [rows] = await db.execute(
    `SELECT id, model_number
     FROM customer_models
     WHERE model_spec_id = ?
       AND status = 'ACTIVE'
     ORDER BY model_number`,
    [modelSpecId]
  );
  return rows;
}

// 5️⃣ Product IDs
async function getProductIds(customerModelId) {
  const [rows] = await db.execute(
    `SELECT id, product_code
     FROM product_ids
     WHERE customer_model_id = ?
       AND status = 'ACTIVE'
     ORDER BY product_code`,
    [customerModelId]
  );
  return rows;
}

module.exports = {
  getCategories,
  getSubCategories,
  getModelSpecifications,
  getCustomerModels,
  getProductIds
};
