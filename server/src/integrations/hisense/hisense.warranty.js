const axios = require("axios");

const WARRANTY_URL = process.env.HISENSE_WARRANTY_URL;
const HISENSE_USERNAME = process.env.HISENSE_USERNAME;
const HISENSE_PASSWORD = process.env.HISENSE_PASSWORD;

const getHisenseWarranty = async ({ PUR_CHAN, PUR_DATE, MODEL }) => {
    try {
        const response = await axios({
            method: "GET",
            url: WARRANTY_URL,
            headers: {
                "Content-Type": "application/json"
            },
            auth: {
                username: HISENSE_USERNAME,
                password: HISENSE_PASSWORD
            },
            data: {
                PUR_CHAN,
                PUR_DATE,
                MODEL,
            },
            timeout: 10000, // 10 sec timeout
        });

        return response.data;
    } catch (error) {
        console.error("Hisense Warranty Error:", error.response?.data || error.message);

        throw {
            status: error.response?.status || 500,
            message: error.response?.data || "Failed to fetch warranty from Hisense",
        };
    }
};

module.exports = { getHisenseWarranty };
