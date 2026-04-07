const axios = require("axios");
const { parseStringPromise, processors } = require("xml2js");
const db = require("../../config/db");

const HISENSE_SOAP_URL = process.env.HISENSE_SOAP_URL;
const HISENSE_USERNAME = process.env.HISENSE_USERNAME;
const HISENSE_PASSWORD = process.env.HISENSE_PASSWORD;

const retryFailedSapCreates = async () => {

    const connection = await db.getConnection();

    try {
        // 1049 because started inserting xml payload after this
        const [logs] = await connection.execute(
            `SELECT *
                FROM sap_sync_log
                WHERE status = 'FAILED'
                AND request_type = 'create'
                AND ticket_id > ?`,
            [1049]
        );

        if (!logs.length) {
            console.log("SAP Retry: No failed records");
            return;
        }

        for (const log of logs) {

            let soapStatus = "FAILED";
            let externalTicketNumber = null;
            let soapError = null;
            let rawResponse = null;

            try {

                const response = await axios.post(
                    HISENSE_SOAP_URL,
                    log.request_payload,
                    {
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
                    }
                );

                rawResponse = response.data;

                const parsed = await parseStringPromise(response.data, {
                    explicitArray: false,
                    tagNameProcessors: [processors.stripPrefix],
                });

                const msgTab =
                    parsed?.Envelope?.Body?.MT_ORDERCREATE_RESPONSE?.MSGTAB;

                if (msgTab?.MSGTYPE === "S") {

                    soapStatus = "SUCCESS";
                    externalTicketNumber = msgTab.OBJECT_ID;

                    // update ticket
                    await connection.execute(
                        `UPDATE tickets
                         SET external_ticket_number = ?
                         WHERE id = ?`,
                        [externalTicketNumber, log.ticket_id]
                    );

                } else {
                    soapError = msgTab?.MSGINFO || "SAP returned failure";
                }

            } catch (err) {
                soapError = err.message;
            }

            // update sap_sync_log
            await connection.execute(
                `UPDATE sap_sync_log
                 SET response_payload = ?,
                 external_ticket_number = ?,
                 status = ?,
                 error_message = ?
                 WHERE id = ?`,
                [
                    rawResponse,
                    externalTicketNumber,
                    soapStatus,
                    soapError,
                    log.id
                ]
            );

        }

        console.log(`SAP Retry processed: ${logs.length}`);

    } catch (err) {

        console.error("SAP Retry Error:", err.message);

    } finally {

        connection.release();

    }

};
const retryFailedSapCreates_dummy = async () => {

    const connection = await db.getConnection();

    try {
        // 1049 because started inserting xml payload after this
        const [logs] = await connection.execute(
            `SELECT t.id,ticket_number,ot.order_type,r.repair_code,sec.section_code,d.defect_code,city,
CONCAT('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:haixin:all2crm">
<soapenv:Header/><soapenv:Body><urn:MT_ORDERCREATE_REQUEST><HEAD><LINE_ID>1</LINE_ID><OBJECT_ID></OBJECT_ID>',
'<SP_ORDER>', ticket_number,'</SP_ORDER>','<PROBLEM_DES>', ifnull(problem_note,'NA'), '</PROBLEM_DES>',
'<ORDER_SOURCE>ZWO4</ORDER_SOURCE><SALES_ORG>O 50000615</SALES_ORG><DIS_CHANNEL>11</DIS_CHANNEL><DIVISION>00</DIVISION>',
'<ORDER_TYPE>',ot.order_type,'</ORDER_TYPE>', '<ORDER_STATUS>E0003</ORDER_STATUS><CREATE_USER></CREATE_USER>',
'<CREATE_DATE>',DATE_FORMAT(t.created_at,'%Y%m%d'),'</CREATE_DATE>',
'<ASSIGN_DATE>',DATE_FORMAT(ifnull(assign_date,t.created_at),'%Y%m%d'),'</ASSIGN_DATE>', '<ACK_DATE></ACK_DATE><IN_DEPOT_DATE></IN_DEPOT_DATE><REPAIR_DATE></REPAIR_DATE><WARRANTYPE>I</WARRANTYPE><SERVICE_TYPE></SERVICE_TYPE><IN_PROGRESS>IN022</IN_PROGRESS>',
'<PROBLEM_NOTE>',ifnull(agent_remarks,'NA'),'</PROBLEM_NOTE>',
'<REPAIR_NOTE></REPAIR_NOTE><CAN_REASN></CAN_REASN>',
'<PRODUCT_ID>',ifnull(product_code,'NA'),'</PRODUCT_ID>',
'<FACTORY_MODEL></FACTORY_MODEL>',
'<CUSTOMER_MODEL>',ifnull(model_number,'NA'),'</CUSTOMER_MODEL>',
'<SERIALNO>NA</SERIALNO><ZZZSERIALNO1></ZZZSERIALNO1><ZZZSERIALNO2></ZZZSERIALNO2><IMEI1_OLD></IMEI1_OLD><IMEI2_OLD></IMEI2_OLD><EXT_REF></EXT_REF><PURCHASE_DATE>20260106</PURCHASE_DATE>',
'<SYMPTOMS_CODE>',ifnull(symptom_2_code,'NA'),'</SYMPTOMS_CODE>', '<SYMPTOMS_CODE_G>',cat.code,'</SYMPTOMS_CODE_G>',
'<SYMPTOMS_CODE_TXT></SYMPTOMS_CODE_TXT>', '<DEFECT_CODE>',d.defect_code,'</DEFECT_CODE>',
'<DEFECT_CODE_G>',cat.code,'</DEFECT_CODE_G>', '<DEFECT_CODE_TXT></DEFECT_CODE_TXT>',
'<REPAIR_CODE>',r.repair_code,'</REPAIR_CODE>', '<REPAIR_CODE_G>',cat.code,'</REPAIR_CODE_G>',
'<REPAIR_CODE_TXT></REPAIR_CODE_TXT><CONDITION_CODE>0</CONDITION_CODE>',
'<SECTION_CODE>',sec.section_code,'</SECTION_CODE>', '<MBL_CLT_TYPE></MBL_CLT_TYPE><PACAKGING></PACAKGING><PURCHASE_INVOICE_NO></PURCHASE_INVOICE_NO><SP_PARTNER>204272</SP_PARTNER><END_USER_TYPE>DEALER</END_USER_TYPE><TITLE></TITLE><END_USER_ID></END_USER_ID>',
'<END_FIRST_NAME>',first_name,'</END_FIRST_NAME>', '<END_LAST_NAME>',last_name,'</END_LAST_NAME>',
'<END_COMP_NAME></END_COMP_NAME>', '<END_TELEPHONE>',primary_phone,'</END_TELEPHONE>',
'<END_CELL_PHONE></END_CELL_PHONE>', '<END_COUNTRY>IN</END_COUNTRY>', '<END_CITY>',c.city,'</END_CITY>',
'<END_PROVINCE>',province,'</END_PROVINCE>', '<END_ZIP_CODE>',zip_code,'</END_ZIP_CODE>',
'<END_ADDRESS1>',address_line1,'</END_ADDRESS1>', '<END_ADDRESS2>',address_line2,'</END_ADDRESS2>',
'<END_ADDRESS3>',address_line3,'</END_ADDRESS3>', '<END_USER_BUILDING_CODE></END_USER_BUILDING_CODE>',
'<END_EMAIL>',email,'</END_EMAIL>', '<STORE_ID></STORE_ID><STORE_NAME1></STORE_NAME1><STORE_NAME2></STORE_NAME2><STORE_PHONE></STORE_PHONE><STORE_COUNTRY></STORE_COUNTRY><STORE_CITY></STORE_CITY><STORE_PROVINCE></STORE_PROVINCE><STORE_ZIP_CODE></STORE_ZIP_CODE><STORE_ADDRESS1></STORE_ADDRESS1><STORE_ADDRESS2></STORE_ADDRESS2><STORE_ADDRESS3></STORE_ADDRESS3><STORE_BUILDING_CODE></STORE_BUILDING_CODE><STORE_EMAIL></STORE_EMAIL><STORE_REFERENCE_NO></STORE_REFERENCE_NO><STORE_CONTACT_PERSON></STORE_CONTACT_PERSON><STORE_CONTACT_PHONE></STORE_CONTACT_PHONE><STORE_CONTACT_CELLPHONE></STORE_CONTACT_CELLPHONE><STORE_CONTACT_EMAIL></STORE_CONTACT_EMAIL><COLLECT_POINT></COLLECT_POINT><TRACKING_NO_FR_COM></TRACKING_NO_FR_COM><TRACKING_NO_FR></TRACKING_NO_FR><TRACKING_NO_TO_COM></TRACKING_NO_TO_COM><TRACKING_NO_TO></TRACKING_NO_TO><OPERATOR_CODE></OPERATOR_CODE><FIRMWARE></FIRMWARE><HEAD_FIELD1>',cst.consulting_type_code,'</HEAD_FIELD1><HEAD_FIELD2></HEAD_FIELD2><HEAD_FIELD3></HEAD_FIELD3><HEAD_FIELD4></HEAD_FIELD4><HEAD_FIELD5></HEAD_FIELD5><ITEM><ITEM_NUMBER></ITEM_NUMBER><ITEM_PRODUCT_ID></ITEM_PRODUCT_ID><ITEM_PRODUCT_DES></ITEM_PRODUCT_DES><ITEM_QUANTITY></ITEM_QUANTITY><ITEM_SERIAL_NO></ITEM_SERIAL_NO><ITEM_CATEGORY></ITEM_CATEGORY><ITEM_STATUS></ITEM_STATUS><ITEM_NET_VALUE></ITEM_NET_VALUE><ITEM_FIELD1></ITEM_FIELD1><ITEM_FIELD2></ITEM_FIELD2><ITEM_FIELD3></ITEM_FIELD3><ITEM_FIELD4></ITEM_FIELD4><ITEM_FIELD5></ITEM_FIELD5></ITEM></HEAD></urn:MT_ORDERCREATE_REQUEST></soapenv:Body></soapenv:Envelope>' ) AS xml_payload
FROM 
(SELECT * FROM tickets WHERE external_ticket_number is null and order_type_id=2 and(customer_product_id is not null and  order_type_id  is not null and  symptom_l1_id  is not null and  symptom_l2_id  is not null and  section_id  is not null and defect_id  is not null and repair_action_id is not null)
)t
LEFT JOIN customers c ON c.id = t.customer_id
LEFT JOIN customer_products cp ON cp.id = t.customer_product_id
left join product_ids pi on t.customer_product_id=pi.id
left join customer_models cm on pi.customer_model_id=cm.id
      LEFT JOIN order_type_master ot ON ot.id = t.order_type_id 
      LEFT JOIN order_source_master os ON os.id = t.order_source_id
      LEFT JOIN service_type_master stype ON stype.id = t.service_type_id
      LEFT JOIN complaint_type_master ct ON ct.id = t.complaint_type_id
      LEFT JOIN consulting_type_master cst ON cst.id = t.consulting_type_id
      LEFT JOIN symptom_level_1_master s1 ON s1.id = t.symptom_l1_id
      LEFT JOIN categories cat ON s1.category_id = cat.id
      LEFT JOIN symptom_level_2_master s2 ON s2.id = t.symptom_l2_id
      LEFT JOIN section_master sec ON sec.id = t.section_id
      LEFT JOIN defect_master d ON d.id = t.defect_id
      LEFT JOIN repair_action_master r ON r.id = t.repair_action_id
      LEFT JOIN status_master sm ON sm.id = t.current_status_id
      LEFT JOIN stage_master sg ON sg.id = t.current_stage_id ;`,
        );

        if (!logs.length) {
            console.log("SAP Retry: No failed records");
            return;
        }

        for (const log of logs) {

            let soapStatus = "FAILED";
            let externalTicketNumber = null;
            let soapError = null;
            let rawResponse = null;

            try {

                const response = await axios.post(
                    HISENSE_SOAP_URL,
                    log.xml_payload,
                    {
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
                    }
                );

                rawResponse = response.data;

                const parsed = await parseStringPromise(response.data, {
                    explicitArray: false,
                    tagNameProcessors: [processors.stripPrefix],
                });

                const msgTab =
                    parsed?.Envelope?.Body?.MT_ORDERCREATE_RESPONSE?.MSGTAB;

                if (msgTab?.MSGTYPE === "S") {

                    soapStatus = "SUCCESS";
                    externalTicketNumber = msgTab.OBJECT_ID;

                    // update ticket
                    await connection.execute(
                        `UPDATE tickets
                         SET external_ticket_number = ?
                         WHERE id = ?`,
                        [externalTicketNumber, log.id]
                    );

                } else {
                    soapError = msgTab?.MSGINFO || "SAP returned failure";
                }

            } catch (err) {
                soapError = err.message;
            }

            // update sap_sync_log
            // await connection.execute(
            //     `UPDATE sap_sync_log
            //      SET response_payload = ?,
            //      external_ticket_number = ?,
            //      status = ?,
            //      error_message = ?
            //      WHERE id = ?`,
            //     [
            //         rawResponse,
            //         externalTicketNumber,
            //         soapStatus,
            //         soapError,
            //         log.id
            //     ]
            // );

            await connection.query(
  `INSERT INTO sap_sync_log (
      ticket_id,
      ticket_number,
      order_type_code,
      request_payload,
      response_payload,
      external_ticket_number,
      status,
      error_message,
      request_type
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    log.id,
    log.ticket_number,
    log.order_type,
    log.xml_payload,
    rawResponse,
    externalTicketNumber,
    soapStatus,
    soapError,
    "create"
  ]
);

        }

        console.log(`SAP Retry processed: ${logs.length}`);

    } catch (err) {

        console.error("SAP Retry Error:", err.message);

    } finally {

        connection.release();

    }

};

module.exports = retryFailedSapCreates;