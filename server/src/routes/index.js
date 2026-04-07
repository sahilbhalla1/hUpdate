const express = require('express');
const router = express.Router();

// =====================
// Public routes
// =====================
const authRoutes = require('../modules/auth/auth.routes');

// =====================
// Protected routes
// =====================
const userRoutes = require('../modules/users/user.routes');
const ticketRoutes = require('../modules/tickets/ticket.routes');
const pincodeRoutes = require('../modules/pincode/pincode.routes');
const customerRoutes = require('../modules/customers/customer.routes');
const masterRoutes = require('../modules/master/master.routes');
const masterOrderRoutes = require('../modules/masters/master.routes');
const warrantyRoutes = require("../modules/warranty/warranty.routes");
const serviceTypeRoutes = require("../modules/serviceType/serviceType.routes");
const orderSourceRoutes = require("../modules/orderSource/orderSource.routes");
const orderTypeRoutes = require("../modules/orderType/orderType.routes");
const symptomLevel1Routes = require("../modules/symptomLevel1/symptomLevel1.routes");
const symptomLevel2Routes = require("../modules/symptomLevel2/symptomLevel2.routes");
const sectionRoutes = require("../modules/section/section.routes");
const defectRoutes = require("../modules/defect/defect.routes");
const repairActionRoutes = require("../modules/repairAction/repairAction.routes");
const category= require("../modules/product_master/category/category_product_master.routes");
const subcategory = require("../modules/product_master/subcategory/subcategory.routes");
const modelSpec = require("../modules/product_master/modelSpec/modelSpec.routes");
const customerModel = require("../modules/product_master/customerModel/customerModel.route");
const product = require("../modules/product_master/product/product.route");

// Middlewares
const authMiddleware = require('../middleware/auth');

// ---------------------
// Public
// ---------------------
router.use('/auth', authRoutes);

// ---------------------
// Protected (auth required)
// ---------------------
router.use(authMiddleware);

router.use('/users', userRoutes);
router.use('/tickets', ticketRoutes);
router.use('/pincodes', pincodeRoutes);
router.use('/customers', customerRoutes);

router.use('/master', masterRoutes);
router.use('/masters-orders', masterOrderRoutes);
router.use("/warranty", warrantyRoutes);
router.use("/service-type", serviceTypeRoutes);
router.use("/order-source", orderSourceRoutes);
router.use("/order-type", orderTypeRoutes);
router.use("/symptom-level1", symptomLevel1Routes);
router.use("/symptom-level2", symptomLevel2Routes);
router.use("/section", sectionRoutes);
router.use("/defect", defectRoutes);
router.use("/repair-action", repairActionRoutes);
router.use("/product-master", category);
router.use("/pro-mst/sub", subcategory);
router.use("/modspec", modelSpec);
router.use("/customer-models", customerModel);
router.use("/products", product);
module.exports = router;

