const pincodeService = require("./pincode.service");

async function fetchPincode(req, res) {
  try {
    const { pincode } = req.params;

    // Basic validation (India: 6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode format"
      });
    }

    const data = await pincodeService.getPincodeByCode(pincode);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found"
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Pincode fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  fetchPincode
};
