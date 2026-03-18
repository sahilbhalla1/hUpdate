function mapFrontendToDb(data) {
    return {
        customerId: data.CUSTOMER_ID,
        title: data.TITLE,
        firstName: data.END_FIRST_NAME?.trim(),
        lastName: data.END_LAST_NAME?.trim() ?? null,
        primaryPhone: data.END_TELEPHONE,
        alternatePhone: data.END_CELL_PHONE,
        email: data.END_EMAIL?.toLowerCase(),
        companyName: data.END_COMP_NAME,
        countryCode: 'IN',
        zipCode: data.END_ZIP_CODE,
        city: data.END_CITY,
        province: data.END_PROVINCE,
        addressLine1: data.END_ADDRESS1,
        addressLine2: data.END_ADDRESS2,
        addressLine3: data.END_ADDRESS3,

        customerProductId: data.customerProductId,
        productId: data.PRODUCT_ID,
        warrantyTypeId: data.WARRANTYPEID,
        serialNo: data.SERIALNO,
        serialNoAlt: data.SERIALNO1,
        purchaseDate: data.PURCHASE_DATE,
        purchaseChannel: data.PURCHASE_CHANNEL,
        purchasePartner: data.PURCHASE_Partner,

        symptom1Id: data.SYMPTOM_1_ID,
        symptom2Id: data.SYMPTOM_2_ID,
        sectionId: data.SECTION_ID,
        defectId: data.DEFECT_ID,
        repairActionId: data.REPAIR_ID,
        conditionFlag: data.CONDITION_CODE,
        problemNote: data.problem_note,
        agentRemarks: data.agent_remarks,
        assignDate: data.ASSIGN_DATE,

        orderTypeId: data.ORDER_TYPE_ID,
        orderTypeCode: data.ORDER_TYPE_CODE,
        orderSourceId: data.ORDER_SOURCE_ID,
        serviceTypeId: data.SERVICE_TYPE_ID,
        complaintTypeCode: data.COMPLAINT_TYPE_CODE,
        complaintTypeId: data.COMPLAINT_TYPE_ID,
        consultingTypeCode: data.CONSULTING_TYPE_CODE,
        consultingTypeId: data.CONSULTING_TYPE_ID,
        consultingType: data.CONSULTING_TYPE,
        statusId: data.STATUS_ID,
        stageId: data.STAGE_ID ?? null,

        socialX: data.END_Socials.x ?? null,
        socialFacebook: data.END_Socials.facebook ?? null,
        socialLinkedin: data.END_Socials.linkedin ?? null,
        socialInstagram: data.END_Socials.instagram ?? null,
        socialYoutube: data.END_Socials.youtube ?? null,
    };
}

function normalizeTitle(title) {
    if (!title) return null;

    const cleaned = title.trim().toUpperCase();

    if (cleaned === 'MR') return 'MR.';
    if (cleaned === 'MS') return 'MS.';
    if (cleaned === 'MRS') return 'MRS.';

    if (cleaned === 'MR.' || cleaned === 'MS.' || cleaned === 'MRS.')
        return cleaned;

    return cleaned;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function mapDbToSoap(ticketData) {
    return {
        OBJECT_ID: ticketData.OBJECT_ID, //Hisense ID
        SP_ORDER: ticketData.SP_ORDER, // DB ID
        LINE_ID: 1,
        CATEGORY_CODE: ticketData.Category_Code,
        ORDER_TYPE: ticketData.ORDER_TYPE_CODE,
        ORDER_SOURCE: ticketData.ORDER_TYPE_CODE === "ZSV1" ? ticketData.ORDER_SOURCE_CODE : ticketData.ORDER_TYPE_CODE,
        SERVICE_TYPE: ticketData.SERVICE_TYPE_CODE,

        PROBLEM_DES: ticketData.problem_note,
        SALES_ORG: "O 50000615",
        DIS_CHANNEL: "11",
        DIVISION: "00",
        ORDER_STATUS: ticketData.STATUS_CODE,
        CREATE_USER: ticketData.CREATE_USER,
        CREATE_DATE: ticketData.CREATE_DATE || new Date().toISOString().slice(0, 10).replace(/-/g, ""),
        ASSIGN_DATE: formatDate(ticketData.ASSIGN_DATE),
        ACK_DATE: ticketData.ACK_DATE,
        IN_DEPOT_DATE: ticketData.IN_DEPOT_DATE,
        REPAIR_DATE: ticketData.REPAIR_DATE,
        WARRANTYPE: ticketData.WARRANTYPEID,
        IN_PROGRESS: "IN022",
        // IN_PROGRESS: ticketData.STAGE_CODE,
        PROBLEM_NOTE: ticketData.agent_remarks,
        REPAIR_NOTE: ticketData.REPAIR_NOTE,
        CAN_REASN: ticketData.CAN_REASN,

        PRODUCT_ID: ticketData.PRODUCT_ID_HISENSE,
        // PRODUCT_ID: "3TE32G114258", //ticketData.PRODUCT_ID_HISENSE
        FACTORY_MODEL: ticketData.FACTORY_MODEL,
        CUSTOMER_MODEL: ticketData.CUSTOMER_MODEL,
        SERIALNO: ticketData.SERIALNO,
        ZZZSERIALNO1: ticketData.ZZZSERIALNO1,
        ZZZSERIALNO2: ticketData.ZZZSERIALNO2,
        IMEI1_OLD: ticketData.IMEI1_OLD,
        IMEI2_OLD: ticketData.IMEI2_OLD,
        EXT_REF: ticketData.EXT_REF,
        PURCHASE_DATE: formatDate(ticketData.PURCHASE_DATE),

        SYMPTOMS_CODE: ticketData.SYMPTOM_1_CODE,
        SYMPTOMS_CODE_G: ticketData.Category_Code,
        SYMPTOMS_CODE_TXT: ticketData.SYMPTOM_1,
        DEFECT_CODE: ticketData.DEFECT_CODE,
        DEFECT_CODE_G: ticketData.Category_Code,
        DEFECT_CODE_TXT: ticketData.DEFECT,
        REPAIR_CODE: ticketData.REPAIR_CODE,
        REPAIR_CODE_G: ticketData.Category_Code,
        REPAIR_CODE_TXT: ticketData.REPAIR,
        CONDITION_CODE: ticketData.CONDITION_CODE,
        SECTION_CODE: ticketData.SECTION_CODE,
        MBL_CLT_TYPE: ticketData.MBL_CLT_TYPE,
        PACAKGING: ticketData.PACAKGING,
        PURCHASE_INVOICE_NO: ticketData.PURCHASE_INVOICE_NO,

        SP_PARTNER: "204272",

        END_USER_TYPE: ticketData.END_USER_TYPE,
        TITLE: normalizeTitle(ticketData.TITLE),
        END_USER_ID: ticketData.END_USER_ID,
        END_FIRST_NAME: ticketData.END_FIRST_NAME,
        END_LAST_NAME: ticketData.END_LAST_NAME,
        END_COMP_NAME: ticketData.END_COMP_NAME,
        END_TELEPHONE: ticketData.END_TELEPHONE,
        END_CELL_PHONE: ticketData.END_CELL_PHONE,
        END_COUNTRY: "IN",
        END_CITY: ticketData.END_CITY,
        END_PROVINCE: ticketData.END_PROVINCE,
        END_ZIP_CODE: ticketData.END_ZIP_CODE,
        END_ADDRESS1: ticketData.END_ADDRESS1,
        END_ADDRESS2: ticketData.END_ADDRESS2,
        END_ADDRESS3: ticketData.END_ADDRESS3,
        END_USER_BUILDING_CODE: ticketData.END_USER_BUILDING_CODE,
        END_EMAIL: ticketData.END_EMAIL,

        STORE_ID: ticketData.STORE_ID,
        STORE_NAME1: ticketData.STORE_NAME1,
        STORE_NAME2: ticketData.STORE_NAME2,
        STORE_PHONE: ticketData.STORE_PHONE,
        STORE_COUNTRY: ticketData.STORE_COUNTRY,
        STORE_CITY: ticketData.STORE_CITY,
        STORE_PROVINCE: ticketData.STORE_PROVINCE,
        STORE_ZIP_CODE: ticketData.STORE_ZIP_CODE,
        STORE_ADDRESS1: ticketData.STORE_ADDRESS1,
        STORE_ADDRESS2: ticketData.STORE_ADDRESS2,
        STORE_ADDRESS3: ticketData.STORE_ADDRESS3,
        STORE_BUILDING_CODE: ticketData.STORE_BUILDING_CODE,
        STORE_EMAIL: ticketData.STORE_EMAIL,
        STORE_REFERENCE_NO: ticketData.STORE_REFERENCE_NO,
        STORE_CONTACT_PERSON: ticketData.STORE_CONTACT_PERSON,
        STORE_CONTACT_PHONE: ticketData.STORE_CONTACT_PHONE,
        STORE_CONTACT_CELLPHONE: ticketData.STORE_CONTACT_CELLPHONE,
        STORE_CONTACT_EMAIL: ticketData.STORE_CONTACT_EMAIL,

        COLLECT_POINT: ticketData.COLLECT_POINT,
        TRACKING_NO_FR_COM: ticketData.TRACKING_NO_FR_COM,
        TRACKING_NO_FR: ticketData.TRACKING_NO_FR,
        TRACKING_NO_TO_COM: ticketData.TRACKING_NO_TO_COM,
        TRACKING_NO_TO: ticketData.TRACKING_NO_TO,
        OPERATOR_CODE: ticketData.OPERATOR_CODE,
        FIRMWARE: ticketData.FIRMWARE,

        HEAD_FIELD1: ticketData.HEAD_FIELD1,
        HEAD_FIELD2: ticketData.HEAD_FIELD2,
        HEAD_FIELD3: ticketData.HEAD_FIELD3,
        HEAD_FIELD4: ticketData.HEAD_FIELD4,
        HEAD_FIELD5: ticketData.HEAD_FIELD5,

        ITEM_NUMBER: ticketData.ITEM_NUMBER,
        ITEM_PRODUCT_ID: ticketData.ITEM_PRODUCT_ID,
        ITEM_PRODUCT_DES: ticketData.ITEM_PRODUCT_DES,
        ITEM_QUANTITY: ticketData.ITEM_QUANTITY,
        ITEM_SERIAL_NO: ticketData.ITEM_SERIAL_NO,
        ITEM_CATEGORY: ticketData.ITEM_CATEGORY,
        ITEM_STATUS: ticketData.ITEM_STATUS,
        ITEM_NET_VALUE: ticketData.ITEM_NET_VALUE,
        ITEM_FIELD1: ticketData.ITEM_FIELD1,
        ITEM_FIELD2: ticketData.ITEM_FIELD2,
        ITEM_FIELD3: ticketData.ITEM_FIELD3,
        ITEM_FIELD4: ticketData.ITEM_FIELD4,
        ITEM_FIELD5: ticketData.ITEM_FIELD5,
    };
}

function mapDbToSoapUpdate(ticketData) {
    return {

        OBJECT_ID: ticketData.externalTicketNumber,

        // SP_ORDER: ticketData.ticketNumber,
        ORDER_SOURCE: ticketData.ORDER_TYPE_CODE === "ZSV1" ? ticketData.ORDER_SOURCE_CODE : ticketData.ORDER_TYPE_CODE,

        ORDER_TYPE: ticketData.ORDER_TYPE_CODE,
        ORDER_STATUS: ticketData.STATUS_CODE,

        ACK_DATE: ticketData.ACK_DATE,
        IN_DEPOT_DATE: ticketData.IN_DEPOT_DATE,
        // REPAIR_DATE: ticketData.REPAIR_DATE,

        WARRANTYPE: ticketData.WARRANTYPEID,

        IN_PROGRESS: ticketData.STAGE_CODE,

        PROBLEM_NOTE: ticketData.agent_remarks,
        PROBLEM_DES: ticketData.problem_note,
        REPAIR_NOTE: ticketData.REPAIR_NOTE,
        CAN_REASN: ticketData.CAN_REASN,

        PRODUCT_ID: ticketData.PRODUCT_ID_HISENSE,
        // PRODUCT_ID: "3TE32G114258",//ticketData.PRODUCT_ID_HISENSE
        CUSTOMER_MODEL: ticketData.CUSTOMER_MODEL,

        SERIALNO: ticketData.SERIALNO,
        ZZZSERIALNO1: ticketData.ZZZSERIALNO1,
        // ZZZSERIALNO2: ticketData.ZZZSERIALNO2,

        // IMEI1_OLD: ticketData.IMEI1_OLD,
        // IMEI2_OLD: ticketData.IMEI2_OLD,

        // EXT_REF: ticketData.EXT_REF,
        PURCHASE_DATE: formatDate(ticketData.PURCHASE_DATE),

        SYMPTOMS_CODE: ticketData.SYMPTOM_1_CODE,
        SYMPTOMS_CODE_G: ticketData.Category_Code,
        DEFECT_CODE: ticketData.DEFECT_CODE,
        DEFECT_CODE_G: ticketData.Category_Code,
        REPAIR_CODE: ticketData.REPAIR_CODE,
        REPAIR_CODE_G: ticketData.Category_Code,

        CONDITION_CODE: ticketData.CONDITION_CODE,
        SECTION_CODE: ticketData.SECTION_CODE,

        MBL_CLT_TYPE: ticketData.MBL_CLT_TYPE,
        PACAKGING: ticketData.PACAKGING,
        PURCHASE_INVOICE_NO: ticketData.PURCHASE_INVOICE_NO,

        TRACKING_NO_FR_COM: "",
        TRACKING_NO_FR: "",
        TRACKING_NO_TO_COM: "",
        TRACKING_NO_TO: "",

        OPERATOR_CODE: "",
        FIRMWARE: "",

        HEAD_FIELD1: "",
        HEAD_FIELD2: "",
        HEAD_FIELD3: "",
        HEAD_FIELD4: "",
        HEAD_FIELD5: "",

        ITEM_NUMBER: "",
        ITEM_PRODUCT_ID: "",
        ITEM_PRODUCT_DES: "",
        ITEM_QUANTITY: "",
        ITEM_SERIAL_NO: "",
        ITEM_CATEGORY: "",
        ITEM_STATUS: "",
        ITEM_NET_VALUE: "",
        ITEM_FIELD1: "",
        ITEM_FIELD2: "",
        ITEM_FIELD3: "",
        ITEM_FIELD4: "",
        ITEM_FIELD5: "",
    };
}

module.exports = { mapFrontendToDb, mapDbToSoap, mapDbToSoapUpdate };