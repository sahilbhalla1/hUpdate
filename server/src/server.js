// 1️⃣ Load environment variables FIRST
require('dotenv').config({ path: process.cwd() + '/.env' });
// const { startEscalationJob } = require("./jobs/escalation.job");
// 2️⃣ Now import validated config & app
const env = require('./config/env');
const app = require('./app');
// const { syncPendingTickets } = require("../src/modules/tickets/ticket.service");
// startEscalationJob();
app.listen(env.port, async () => {
  console.log(`🚀 Server running on port ${env.port} (${env.nodeEnv})`);

    // run once on restart
  // await syncPendingTickets();
});
// app.listen(env.port, () => {
//   console.log(`🚀 Server running on port ${env.port} (${env.nodeEnv})`);
// });
