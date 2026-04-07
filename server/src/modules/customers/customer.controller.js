const customerService = require("./customer.service");

async function getCustomerByPhone(req, res) {
  try {
    const { phone } = req.params;

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone format"
      });
    }

    const result = await customerService.findCustomerWithProductsByPhone(phone);

    if (!result) {
      return res.status(200).json({
        success: true,
        customerExists: false,
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      customerExists: true,
      data: result
    });

  } catch (error) {
    console.error("Customer lookup error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  getCustomerByPhone
};
