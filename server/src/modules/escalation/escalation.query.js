const db = require("../../config/db");

async function findOverdueTickets() {
  const conn = await db.getConnection();

  try {
    const [rows] = await conn.query(`
      SELECT
        tts.ticket_id,
        tts.level AS current_level,

        jtl_next.id AS next_tat_level_id,
        jtl_next.level AS next_level,
        jtl_next.tat_hours,

        t.journey_id
      FROM ticket_tat_state tts
      JOIN tickets t
        ON t.id = tts.ticket_id

      JOIN journey_tat_levels jtl_current
        ON jtl_current.journey_id = t.journey_id
       AND jtl_current.level = tts.level

      JOIN journey_tat_levels jtl_next
        ON jtl_next.journey_id = t.journey_id
       AND jtl_next.level = tts.level + 1

      WHERE
        tts.due_at < NOW()
        AND tts.escalated = 0
        AND jtl_current.is_final_level = 0
        AND t.status NOT IN ('CLOSED')
    `);

    return rows;
  } finally {
    conn.release();
  }
}

module.exports = { findOverdueTickets };
