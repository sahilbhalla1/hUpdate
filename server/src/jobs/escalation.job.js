const { findOverdueTickets } = require("../modules/escalation/escalation.query");
const { escalateTicketBySLA } = require("../modules/escalation/escalation.service");

function startEscalationJob() {
  console.log("🚨 Escalation job started");

  setInterval(async () => {
    try {
      const overdueTickets = await findOverdueTickets();

      for (const row of overdueTickets) {
        await escalateTicketBySLA(row);
      }
    } catch (err) {
      console.error("❌ Escalation job failed:", err);
    }
  }, 1 * 60 * 1000); // every 5 minutes
}

module.exports = { startEscalationJob };
