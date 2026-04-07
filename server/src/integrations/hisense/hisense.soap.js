const axios = require("axios");
const { parseStringPromise, processors } = require("xml2js");
const db = require("../../config/db");

const HISENSE_SOAP_URL = process.env.HISENSE_SOAP_URL;
const HISENSE_USERNAME = process.env.HISENSE_USERNAME;
const HISENSE_PASSWORD = process.env.HISENSE_PASSWORD;

const val = (v) => (v === undefined || v === null ? "" : v);
// ${val(payload.CREATE_USER)}
const buildSoapEnvelope = (payload = {}) => {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:haixin:all2crm">
<soapenv:Header/>
<soapenv:Body>
<urn:MT_ORDERCREATE_REQUEST>
<HEAD>

<LINE_ID>1</LINE_ID>
<OBJECT_ID>${val(payload.OBJECT_ID)}</OBJECT_ID>
<SP_ORDER>${val(payload.SP_ORDER || payload.spOrder)}</SP_ORDER>
<PROBLEM_DES>${val(payload.PROBLEM_DES || payload.problemDescription)}</PROBLEM_DES>
<ORDER_SOURCE>${val(payload.ORDER_SOURCE)}</ORDER_SOURCE>
<SALES_ORG>${val(payload.SALES_ORG || payload.salesOrg)}</SALES_ORG>
<DIS_CHANNEL>${val(payload.DIS_CHANNEL || "11")}</DIS_CHANNEL>
<DIVISION>${val(payload.DIVISION || "00")}</DIVISION>
<ORDER_TYPE>${val(payload.ORDER_TYPE)}</ORDER_TYPE>
<ORDER_STATUS>${val(payload.ORDER_STATUS)}</ORDER_STATUS>
<CREATE_USER></CREATE_USER>
<CREATE_DATE>${val(payload.CREATE_DATE || payload.createDate)}</CREATE_DATE>
<ASSIGN_DATE>${val(payload.ASSIGN_DATE)}</ASSIGN_DATE>
<ACK_DATE>${val(payload.ACK_DATE)}</ACK_DATE>
<IN_DEPOT_DATE>${val(payload.IN_DEPOT_DATE)}</IN_DEPOT_DATE>
<REPAIR_DATE>${val(payload.REPAIR_DATE)}</REPAIR_DATE>
<WARRANTYPE>${val(payload.WARRANTYPE)}</WARRANTYPE>
<SERVICE_TYPE>${val(payload.SERVICE_TYPE)}</SERVICE_TYPE>
<IN_PROGRESS>${val(payload.IN_PROGRESS || "E0001")}</IN_PROGRESS>
<PROBLEM_NOTE>${val(payload.PROBLEM_NOTE)}</PROBLEM_NOTE>
<REPAIR_NOTE>${val(payload.REPAIR_NOTE)}</REPAIR_NOTE>
<CAN_REASN>${val(payload.CAN_REASN)}</CAN_REASN>
<PRODUCT_ID>${val(payload.PRODUCT_ID)}</PRODUCT_ID>
<FACTORY_MODEL>${val(payload.FACTORY_MODEL)}</FACTORY_MODEL>
<CUSTOMER_MODEL>${val(payload.CUSTOMER_MODEL)}</CUSTOMER_MODEL>
<SERIALNO>${val(payload.SERIALNO)}</SERIALNO>
<ZZZSERIALNO1>${val(payload.ZZZSERIALNO1)}</ZZZSERIALNO1>
<ZZZSERIALNO2>${val(payload.ZZZSERIALNO2)}</ZZZSERIALNO2>
<IMEI1_OLD>${val(payload.IMEI1_OLD)}</IMEI1_OLD>
<IMEI2_OLD>${val(payload.IMEI2_OLD)}</IMEI2_OLD>
<EXT_REF>${val(payload.EXT_REF)}</EXT_REF>
<PURCHASE_DATE>${val(payload.PURCHASE_DATE)}</PURCHASE_DATE>
<SYMPTOMS_CODE>${val(payload.SYMPTOMS_CODE)}</SYMPTOMS_CODE>
<SYMPTOMS_CODE_G>${val(payload.SYMPTOMS_CODE_G)}</SYMPTOMS_CODE_G>
<SYMPTOMS_CODE_TXT></SYMPTOMS_CODE_TXT>
<DEFECT_CODE>${val(payload.DEFECT_CODE)}</DEFECT_CODE>
<DEFECT_CODE_G>${val(payload.DEFECT_CODE_G)}</DEFECT_CODE_G>
<DEFECT_CODE_TXT></DEFECT_CODE_TXT>
<REPAIR_CODE>${val(payload.REPAIR_CODE)}</REPAIR_CODE>
<REPAIR_CODE_G>${val(payload.REPAIR_CODE_G)}</REPAIR_CODE_G>
<REPAIR_CODE_TXT></REPAIR_CODE_TXT>
<CONDITION_CODE>${val(payload.CONDITION_CODE)}</CONDITION_CODE>
<SECTION_CODE></SECTION_CODE>
<MBL_CLT_TYPE>${val(payload.MBL_CLT_TYPE)}</MBL_CLT_TYPE>
<PACAKGING>${val(payload.PACAKGING)}</PACAKGING>
<PURCHASE_INVOICE_NO>${val(payload.PURCHASE_INVOICE_NO)}</PURCHASE_INVOICE_NO>
<SP_PARTNER>204272</SP_PARTNER>
<END_USER_TYPE>${val(payload.END_USER_TYPE)}</END_USER_TYPE>
<TITLE></TITLE>
<END_USER_ID>${val(payload.END_USER_ID)}</END_USER_ID>
<END_FIRST_NAME>${val(payload.END_FIRST_NAME)}</END_FIRST_NAME>
<END_LAST_NAME>${val(payload.END_LAST_NAME)}</END_LAST_NAME>
<END_COMP_NAME>${val(payload.END_COMP_NAME)}</END_COMP_NAME>
<END_TELEPHONE>${val(payload.END_TELEPHONE)}</END_TELEPHONE>
<END_CELL_PHONE>${val(payload.END_CELL_PHONE)}</END_CELL_PHONE>
<END_COUNTRY>${val(payload.END_COUNTRY || "IN")}</END_COUNTRY>
<END_CITY>${val(payload.END_CITY)}</END_CITY>
<END_PROVINCE>${val(payload.END_PROVINCE)}</END_PROVINCE>
<END_ZIP_CODE>${val(payload.END_ZIP_CODE)}</END_ZIP_CODE>
<END_ADDRESS1>${val(payload.END_ADDRESS1)}</END_ADDRESS1>
<END_ADDRESS2>${val(payload.END_ADDRESS2)}</END_ADDRESS2>
<END_ADDRESS3>${val(payload.END_ADDRESS3)}</END_ADDRESS3>
<END_USER_BUILDING_CODE>${val(payload.END_USER_BUILDING_CODE)}</END_USER_BUILDING_CODE>
<END_EMAIL>${val(payload.END_EMAIL)}</END_EMAIL>
<STORE_ID>${val(payload.STORE_ID)}</STORE_ID>
<STORE_NAME1>${val(payload.STORE_NAME1)}</STORE_NAME1>
<STORE_NAME2>${val(payload.STORE_NAME2)}</STORE_NAME2>
<STORE_PHONE>${val(payload.STORE_PHONE)}</STORE_PHONE>
<STORE_COUNTRY>${val(payload.STORE_COUNTRY)}</STORE_COUNTRY>
<STORE_CITY>${val(payload.STORE_CITY)}</STORE_CITY>
<STORE_PROVINCE>${val(payload.STORE_PROVINCE)}</STORE_PROVINCE>
<STORE_ZIP_CODE>${val(payload.STORE_ZIP_CODE)}</STORE_ZIP_CODE>
<STORE_ADDRESS1>${val(payload.STORE_ADDRESS1)}</STORE_ADDRESS1>
<STORE_ADDRESS2>${val(payload.STORE_ADDRESS2)}</STORE_ADDRESS2>
<STORE_ADDRESS3>${val(payload.STORE_ADDRESS3)}</STORE_ADDRESS3>
<STORE_BUILDING_CODE>${val(payload.STORE_BUILDING_CODE)}</STORE_BUILDING_CODE>
<STORE_EMAIL>${val(payload.STORE_EMAIL)}</STORE_EMAIL>
<STORE_REFERENCE_NO>${val(payload.STORE_REFERENCE_NO)}</STORE_REFERENCE_NO>
<STORE_CONTACT_PERSON>${val(payload.STORE_CONTACT_PERSON)}</STORE_CONTACT_PERSON>
<STORE_CONTACT_PHONE>${val(payload.STORE_CONTACT_PHONE)}</STORE_CONTACT_PHONE>
<STORE_CONTACT_CELLPHONE>${val(payload.STORE_CONTACT_CELLPHONE)}</STORE_CONTACT_CELLPHONE>
<STORE_CONTACT_EMAIL>${val(payload.STORE_CONTACT_EMAIL)}</STORE_CONTACT_EMAIL>
<COLLECT_POINT>${val(payload.COLLECT_POINT)}</COLLECT_POINT>
<TRACKING_NO_FR_COM>${val(payload.TRACKING_NO_FR_COM)}</TRACKING_NO_FR_COM>
<TRACKING_NO_FR>${val(payload.TRACKING_NO_FR)}</TRACKING_NO_FR>
<TRACKING_NO_TO_COM>${val(payload.TRACKING_NO_TO_COM)}</TRACKING_NO_TO_COM>
<TRACKING_NO_TO>${val(payload.TRACKING_NO_TO)}</TRACKING_NO_TO>
<OPERATOR_CODE>${val(payload.OPERATOR_CODE)}</OPERATOR_CODE>
<FIRMWARE>${val(payload.FIRMWARE)}</FIRMWARE>
<HEAD_FIELD1>${val(payload.HEAD_FIELD1)}</HEAD_FIELD1>
<HEAD_FIELD2>${val(payload.HEAD_FIELD2)}</HEAD_FIELD2>
<HEAD_FIELD3>${val(payload.HEAD_FIELD3)}</HEAD_FIELD3>
<HEAD_FIELD4>${val(payload.HEAD_FIELD4)}</HEAD_FIELD4>
<HEAD_FIELD5>${val(payload.HEAD_FIELD5)}</HEAD_FIELD5>

<ITEM>
<ITEM_NUMBER>${val(payload.ITEM_NUMBER)}</ITEM_NUMBER>
<ITEM_PRODUCT_ID>${val(payload.ITEM_PRODUCT_ID)}</ITEM_PRODUCT_ID>
<ITEM_PRODUCT_DES>${val(payload.ITEM_PRODUCT_DES)}</ITEM_PRODUCT_DES>
<ITEM_QUANTITY>${val(payload.ITEM_QUANTITY)}</ITEM_QUANTITY>
<ITEM_SERIAL_NO>${val(payload.ITEM_SERIAL_NO)}</ITEM_SERIAL_NO>
<ITEM_CATEGORY>${val(payload.ITEM_CATEGORY)}</ITEM_CATEGORY>
<ITEM_STATUS>${val(payload.ITEM_STATUS)}</ITEM_STATUS>
<ITEM_NET_VALUE>${val(payload.ITEM_NET_VALUE)}</ITEM_NET_VALUE>
<ITEM_FIELD1>${val(payload.ITEM_FIELD1)}</ITEM_FIELD1>
<ITEM_FIELD2>${val(payload.ITEM_FIELD2)}</ITEM_FIELD2>
<ITEM_FIELD3>${val(payload.ITEM_FIELD3)}</ITEM_FIELD3>
<ITEM_FIELD4>${val(payload.ITEM_FIELD4)}</ITEM_FIELD4>
<ITEM_FIELD5>${val(payload.ITEM_FIELD5)}</ITEM_FIELD5>
</ITEM>

</HEAD>
</urn:MT_ORDERCREATE_REQUEST>
</soapenv:Body>
</soapenv:Envelope>
`.trim();
};

const createHisenseOrder = async ({ payload, ticketId, ticketNumber, orderTypeCode }) => {
    const connection = await db.getConnection();
    let soapBody = null;
    let soapStatus = "FAILED";
    let soapError = null;
    let externalTicketNumber = null;
    let rawResponse = null;

    try {
        soapBody = buildSoapEnvelope(payload);

        const response = await axios.post(HISENSE_SOAP_URL, soapBody, {
            headers: {
                "Content-Type": "text/xml;charset=UTF-8",
                "SOAPAction": "\"http://sap.com/xi/WebService/soap1.1\"",
            },
            auth: {
                username: HISENSE_USERNAME,
                password: HISENSE_PASSWORD
            },
            timeout: 30000,
            validateStatus: () => true
        });

        rawResponse = response.data;

        if (!response.headers["content-type"]?.includes("xml")) {
            throw new Error("Non-XML response received");
        }

        const parsed = await parseStringPromise(response.data, {
            explicitArray: false,
            tagNameProcessors: [processors.stripPrefix],
        });

        const msgTab =
            parsed?.Envelope?.Body?.MT_ORDERCREATE_RESPONSE?.MSGTAB;

        if (!msgTab) {
            throw new Error("Invalid SOAP response structure");
        }

        if (msgTab.MSGTYPE === "S") {
            soapStatus = "SUCCESS";
            externalTicketNumber = msgTab.OBJECT_ID || null;
        } else {
            soapError = msgTab.MSGINFO;
        }

        return {
            success: soapStatus === "SUCCESS",
            message: msgTab.MSGINFO,
            objectId: externalTicketNumber,
            raw: rawResponse
        };

    } catch (error) {
        soapError = error.message;
        throw error;

    } finally {

        connection.execute(
            `INSERT INTO sap_sync_log 
        (ticket_id, ticket_number, order_type_code, request_payload, response_payload,
         external_ticket_number, status, error_message,request_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ticketId,
                ticketNumber,
                orderTypeCode,
                soapBody,
                rawResponse,
                externalTicketNumber,
                soapStatus,
                soapError,
                "create"
            ]
        )
            .catch(err => {
                console.error("SAP Log Failed:", err.message);
            })
            .finally(() => {
                connection.release();
            });

    }
};


const buildUpdateSoapEnvelope = (payload = {}) => {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:haixin:all2crm">
<soapenv:Header/>
<soapenv:Body>
<urn:MT_ORDERUPDATE_REQUEST>
<HEAD>

<OBJECT_ID>${val(payload.OBJECT_ID)}</OBJECT_ID>
<SP_ORDER>${val(payload.SP_ORDER)}</SP_ORDER>
<ORDER_SOURCE>${val(payload.ORDER_SOURCE)}</ORDER_SOURCE>
<SALES_ORG>O 50000615</SALES_ORG>
<SP_PARTNER>204272</SP_PARTNER>
<ORDER_TYPE>${val(payload.ORDER_TYPE)}</ORDER_TYPE>
<ORDER_STATUS>${val(payload.ORDER_STATUS)}</ORDER_STATUS>
<DELAYREASONCODE>${val(payload.DELAYREASONCODE)}</DELAYREASONCODE>
<UNSOLVEDCODE>${val(payload.UNSOLVEDCODE)}</UNSOLVEDCODE>
<UNSOLVEDREASON>${val(payload.UNSOLVEDREASON)}</UNSOLVEDREASON>
<ACK_DATE>${val(payload.ACK_DATE)}</ACK_DATE>
<IN_DEPOT_DATE>${val(payload.IN_DEPOT_DATE)}</IN_DEPOT_DATE>
<REPAIR_DATE>${val(payload.REPAIR_DATE)}</REPAIR_DATE>
<ACT_APPOINT_DATE>${val(payload.ACT_APPOINT_DATE)}</ACT_APPOINT_DATE>
<WARRANTYPE>${val(payload.WARRANTYPE)}</WARRANTYPE>
<SERVICE_TYPE>${val(payload.SERVICE_TYPE)}</SERVICE_TYPE>
<IN_PROGRESS>${val(payload.IN_PROGRESS)}</IN_PROGRESS>
<PROBLEM_NOTE>${val(payload.PROBLEM_NOTE)}</PROBLEM_NOTE>
<REPAIR_NOTE>${val(payload.REPAIR_NOTE)}</REPAIR_NOTE>
<PARTS_FEE>${val(payload.PARTS_FEE)}</PARTS_FEE>
<MILEAGE_FEE>${val(payload.MILEAGE_FEE)}</MILEAGE_FEE>
<LABOR_FEE>${val(payload.LABOR_FEE)}</LABOR_FEE>
<TRANSPORT_FEE>${val(payload.TRANSPORT_FEE)}</TRANSPORT_FEE>
<OTHER_FEE>${val(payload.OTHER_FEE)}</OTHER_FEE>
<EXCH_REFU_FEE>${val(payload.EXCH_REFU_FEE)}</EXCH_REFU_FEE>
<TOTAL_FEE>${val(payload.TOTAL_FEE)}</TOTAL_FEE>
<DISTANCE>${val(payload.DISTANCE)}</DISTANCE>
<CAN_REASN>${val(payload.CAN_REASN)}</CAN_REASN>
<PRODUCT_ID>${val(payload.PRODUCT_ID)}</PRODUCT_ID>
<CUSTOMER_MODEL>${val(payload.CUSTOMER_MODEL)}</CUSTOMER_MODEL>
<SERIALNO>${val(payload.SERIALNO)}</SERIALNO>
<ZZZSERIALNO1>${val(payload.ZZZSERIALNO1)}</ZZZSERIALNO1>
<ZZZSERIALNO2>${val(payload.ZZZSERIALNO2)}</ZZZSERIALNO2>
<IMEI1_OLD>${val(payload.IMEI1_OLD)}</IMEI1_OLD>
<IMEI2_OLD>${val(payload.IMEI2_OLD)}</IMEI2_OLD>
<IMEI1_NEW>${val(payload.IMEI1_NEW)}</IMEI1_NEW>
<IMEI2_NEW>${val(payload.IMEI2_NEW)}</IMEI2_NEW>
<EXT_REF>${val(payload.EXT_REF)}</EXT_REF>
<PURCHASE_DATE>${val(payload.PURCHASE_DATE)}</PURCHASE_DATE>
<SYMPTOMS_CODE>${val(payload.SYMPTOMS_CODE)}</SYMPTOMS_CODE>
<SYMPTOMS_CODE_G>${val(payload.SYMPTOMS_CODE_G)}</SYMPTOMS_CODE_G>
<DEFECT_CODE>${val(payload.DEFECT_CODE)}</DEFECT_CODE>
<DEFECT_CODE_G>${val(payload.DEFECT_CODE_G)}</DEFECT_CODE_G>
<REPAIR_CODE>${val(payload.REPAIR_CODE)}</REPAIR_CODE>
<REPAIR_CODE_G>${val(payload.REPAIR_CODE_G)}</REPAIR_CODE_G>
<MBL_CLT_TYPE>${val(payload.MBL_CLT_TYPE)}</MBL_CLT_TYPE>
<PACAKGING>${val(payload.PACAKGING)}</PACAKGING>
<CONDITION_CODE>${val(payload.CONDITION_CODE)}</CONDITION_CODE>
<SECTION_CODE></SECTION_CODE>
<PURCHASE_INVOICE_NO>${val(payload.PURCHASE_INVOICE_NO)}</PURCHASE_INVOICE_NO>
<DEALER_ID>${val(payload.DEALER_ID)}</DEALER_ID>
<STORE_ID>${val(payload.STORE_ID)}</STORE_ID>
<STORE_REFERENCE_NO>${val(payload.STORE_REFERENCE_NO)}</STORE_REFERENCE_NO>
<TRACKING_NO_FR_COM>${val(payload.TRACKING_NO_FR_COM)}</TRACKING_NO_FR_COM>
<TRACKING_NO_FR>${val(payload.TRACKING_NO_FR)}</TRACKING_NO_FR>
<TRACKING_NO_TO_COM>${val(payload.TRACKING_NO_TO_COM)}</TRACKING_NO_TO_COM>
<TRACKING_NO_TO>${val(payload.TRACKING_NO_TO)}</TRACKING_NO_TO>
<OPERATOR_CODE>${val(payload.OPERATOR_CODE)}</OPERATOR_CODE>
<FIRMWARE></FIRMWARE>
<HEAD_FIELD1></HEAD_FIELD1>
<HEAD_FIELD2></HEAD_FIELD2>
<HEAD_FIELD3></HEAD_FIELD3>
<HEAD_FIELD4></HEAD_FIELD4>
<HEAD_FIELD5></HEAD_FIELD5>
<HEAD_FIELD6></HEAD_FIELD6>
<HEAD_FIELD7></HEAD_FIELD7>
<HEAD_FIELD8></HEAD_FIELD8>
<HEAD_FIELD9></HEAD_FIELD9>
<HEAD_FIELD10></HEAD_FIELD10>

<ITEM>
<ITEM_NUMBER></ITEM_NUMBER>
<ITEM_PRODUCT_ID></ITEM_PRODUCT_ID>
<ITEM_PRODUCT_DES></ITEM_PRODUCT_DES>
<ITEM_QUANTITY></ITEM_QUANTITY>
<ITEM_SERIAL_NO></ITEM_SERIAL_NO>
<ITEM_CATEGORY></ITEM_CATEGORY>
<ITEM_STATUS></ITEM_STATUS>
<ITEM_FIELD1></ITEM_FIELD1>
<ITEM_FIELD2></ITEM_FIELD2>
<ITEM_FIELD3></ITEM_FIELD3>
<ITEM_FIELD4></ITEM_FIELD4>
<ITEM_FIELD5></ITEM_FIELD5>
</ITEM>

</HEAD>
</urn:MT_ORDERUPDATE_REQUEST>
</soapenv:Body>
</soapenv:Envelope>
`.trim();
};


const updateHisenseOrder = async ({ payload, ticketId, ticketNumber, orderTypeCode }) => {
    let soapBody = null;
    let soapStatus = "FAILED";
    let soapError = null;
    let externalTicketNumber = null;
    let rawResponse = null;

    try {
        soapBody = buildUpdateSoapEnvelope(payload);
        const response = await axios.post(
            process.env.HISENSE_UPDATE_SOAP_URL,
            soapBody,
            {
                headers: {
                    "Content-Type": "text/xml;charset=UTF-8",
                    "SOAPAction": "\"http://sap.com/xi/WebService/soap1.1\"",
                },
                auth: {
                    username: HISENSE_USERNAME,
                    password: HISENSE_PASSWORD,
                },
                timeout: 30000,
                validateStatus: () => true,
            }
        );

        rawResponse = response.data;

        if (!response.headers["content-type"]?.includes("xml")) {
            throw new Error("Non-XML response received:\n" + response.data);
        }

        const parsed = await parseStringPromise(response.data, {
            explicitArray: false,
            tagNameProcessors: [processors.stripPrefix],
        });

        const fault = parsed?.Envelope?.Body?.Fault;
        if (fault) {
            throw new Error(fault.faultstring || "SOAP Fault");
        }

        const msgTab =
            parsed?.Envelope?.Body?.MT_ORDERUPDATE_RESPONSE?.MSGTAB;

        if (!msgTab) {
            throw new Error("Invalid SOAP response structure:\n" + response.data);
        }

        if (msgTab.MSGTYPE === "S") {
            soapStatus = "SUCCESS";
            externalTicketNumber = msgTab.OBJECT_ID || null;
        } else {
            soapError = msgTab.MSGINFO;
        }

        return {
            success: soapStatus === "SUCCESS",
            message: msgTab.MSGINFO,
            objectId: externalTicketNumber,
            raw: rawResponse
        };

    } catch (error) {

        soapError = error.message;
        throw new Error("Hisense Update SOAP Error: " + error.message);

    } finally {

        // 🔹 async logging (do NOT block SAP response)
        db.getConnection()
            .then(conn => {

                conn.execute(
                    `INSERT INTO sap_sync_log 
                    (ticket_id, ticket_number, order_type_code, request_payload, response_payload,
                     external_ticket_number, status, error_message,request_type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        ticketId,
                        ticketNumber,
                        orderTypeCode,
                        soapBody,
                        rawResponse,
                        externalTicketNumber,
                        soapStatus,
                        soapError,
                        "update"
                    ]
                )
                    .catch(err => console.error("SAP Update Log Failed:", err.message))
                    .finally(() => conn.release());

            })
            .catch(err => console.error("SAP Log Connection Failed:", err.message));

    }
};

const buildServiceOrderSoapEnvelope = (payload = {}) => {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:haixin:all2crm">
<soapenv:Header/>
<soapenv:Body>
<urn:MT_SERVICEORDER_REQUEST>

<SALES_ORG>O 50000615</SALES_ORG>
<CREATE_DAT_FR>${val(payload.CREATE_DAT_FR)}</CREATE_DAT_FR>
<CREATE_DAT_TO>${val(payload.CREATE_DAT_TO)}</CREATE_DAT_TO>
<PARTNER_SP>204272</PARTNER_SP>
<ORDER_TYPE>${val(payload.ORDER_TYPE)}</ORDER_TYPE>
<ORDER_STATUS>${val(payload.ORDER_STATUS)}</ORDER_STATUS>
<OBJECT_ID>${val(payload.OBJECT_ID)}</OBJECT_ID>
<FLAG></FLAG>
<IN_FIELD1></IN_FIELD1>
<IN_FIELD2></IN_FIELD2>
<IN_FIELD3></IN_FIELD3>
<IN_FIELD4></IN_FIELD4>
<IN_FIELD5></IN_FIELD5>

</urn:MT_SERVICEORDER_REQUEST>
</soapenv:Body>
</soapenv:Envelope>
`.trim();
};

const getHisenseServiceOrder = async (payload) => {
    try {
        const soapBody = buildServiceOrderSoapEnvelope(payload);

        const response = await axios.post(
            process.env.HISENSE_FETCH_SERVICEORDER_SOAP_URL,
            soapBody,
            {
                headers: {
                    "Content-Type": "text/xml;charset=UTF-8",
                    "SOAPAction": "\"http://sap.com/xi/WebService/soap1.1\"",
                },
                auth: {
                    username: HISENSE_USERNAME,
                    password: HISENSE_PASSWORD,
                },
                timeout: 30000,
                validateStatus: () => true,
            }
        );

        if (!response.headers["content-type"]?.includes("xml")) {
            throw new Error("Non-XML response received:\n" + response.data);
        }

        const parsed = await parseStringPromise(response.data, {
            explicitArray: false,
            tagNameProcessors: [processors.stripPrefix],
        });

        // 🔥 Handle SOAP Fault
        const fault = parsed?.Envelope?.Body?.Fault;
        if (fault) {
            throw new Error(fault.faultstring || "SOAP Fault");
        }

        const result =
            parsed?.Envelope?.Body?.MT_SERVICEORDER_RESPONSE;

        if (!result) {
            throw new Error("Invalid SOAP response structure:\n" + response.data);
        }

        return {
            success: true,
            data: result,
            raw: response.data,
        };

    } catch (error) {
        throw new Error("Hisense ServiceOrder SOAP Error: " + error.message);
    }
};


module.exports = { createHisenseOrder, updateHisenseOrder, getHisenseServiceOrder };
