const cron = require('node-cron');
const db = require('../config/db');
const { syncServiceOrdersFromSAP } = require('../modules/tickets/ticket.sync.service');
const retryFailedSapCreates = require("../modules/tickets/ticket.failed_ticket_sync");

function formatDateYYYYMMDD(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
}

// '0 */1 * * *'
// cron.schedule('23 14 * * *', async () => {
cron.schedule('0 */1 * * *', async () => {
    const connection = await db.getConnection();

    try {
        const [[lockRow]] = await connection.query(
            `SELECT GET_LOCK('sap_sync_lock_test', 0) AS lockStatus`
        );

        if (lockRow.lockStatus !== 1) {
            console.log('Another instance running. Skipping...');
            return;
        }

        // 🔥 Build date range (today - 7 days)
        const today = new Date();
        const past = new Date();
        past.setDate(today.getDate() - 7);

        const payload = {
            SALES_ORG: "O 50000615",
            CREATE_DAT_FR: formatDateYYYYMMDD(past),
            CREATE_DAT_TO: formatDateYYYYMMDD(today),
            PARTNER_SP: "200072"
        };

        console.log("SAP Cron Payload:", payload);

        const result = await syncServiceOrdersFromSAP(payload);
        console.log("SAP Sync Result:", result);

    } catch (err) {
        console.error('Cron error:', err);
    } finally {
        await connection.query(
            `SELECT RELEASE_LOCK('sap_sync_lock_test')`
        );
        connection.release();
    }
});

// cron.schedule("0 */3 * * *", async () => {

//     const connection = await db.getConnection();
//     let lockAcquired = false;

//     try {

//         const [[lockRow]] = await connection.query(
//             `SELECT GET_LOCK('sap_retry_lock', 0) AS lockStatus`
//         );

//         if (lockRow.lockStatus !== 1) {
//             console.log("Retry cron already running. Skipping...");
//             return;
//         }

//         lockAcquired = true;

//         console.log("Running SAP retry cron");

//         await retryFailedSapCreates();

//     } catch (err) {

//         console.error("SAP Retry Cron Error:", err.message);

//     } finally {

//         if (lockAcquired) {
//             await connection.query(
//                 `SELECT RELEASE_LOCK('sap_retry_lock')`
//             );
//         }

//         connection.release();
//     }

// });