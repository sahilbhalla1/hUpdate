const { getHisenseWarranty } = require("../../integrations/hisense/hisense.warranty");

const fetchWarranty = async (payload) => {
    if (!payload.PUR_CHAN || !payload.PUR_DATE || !payload.MODEL) {
        throw {
            status: 400,
            message: "PUR_CHAN, PUR_DATE and MODEL are required",
        };
    }

    const result = await getHisenseWarranty(payload);

    return result;
};

module.exports = { fetchWarranty };
