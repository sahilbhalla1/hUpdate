const express = require("express");
const router = express.Router();
const controller = require("./master.controller");

router.get("/categories", controller.fetchCategories);
router.get("/sub-categories/:categoryId", controller.fetchSubCategories);
router.get("/model-specifications/:subCategoryId", controller.fetchModelSpecifications);
router.get("/customer-models/:modelSpecId", controller.fetchCustomerModels);
router.get("/product-ids/:customerModelId", controller.fetchProductIds);

module.exports = router;
