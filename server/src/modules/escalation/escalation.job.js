const { processEscalations } = require("./escalation.service");

function startEscalationJob() {
  console.log("🚨 Escalation job started");

  // setInterval(async () => {
  //   try {
  //     await processEscalations();
  //   } catch (err) {
  //     console.error("Escalation job failed:", err);
  //   }
  // }, 1 * 60 * 1000); // every 5 minutes
}

module.exports = { startEscalationJob };
