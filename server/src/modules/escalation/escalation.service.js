const db = require("../../config/db");
const { applyEscalation } = require("./escalation.core");

async function escalateTicketBySLA(row) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[ticket]] = await conn.query(
      `
      SELECT t.*, tts.level
      FROM tickets t
      JOIN ticket_tat_state tts ON t.id = tts.ticket_id
      WHERE t.id = ?
      FOR UPDATE
      `,
      [row.ticket_id]
    );

    if (!ticket) return;

    const nextLevel = {
      id: row.next_tat_level_id,
      level: row.next_level,
      tat_hours: row.tat_hours,
    };
const SYSTEM_USER_ID = 1;
    await applyEscalation({
      conn,
      ticket,
      nextLevel,
      reason: "Auto escalation due to SLA breach",
      actorId: SYSTEM_USER_ID, // system
    });

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { escalateTicketBySLA };
