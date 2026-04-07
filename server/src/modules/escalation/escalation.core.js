exports.applyEscalation = async ({
  conn,
  ticket,
  nextLevel,
  reason,
  actorId = null, // null for system
}) => {
  const startedAt = new Date();
  const dueAt = new Date(
    startedAt.getTime() + nextLevel.tat_hours * 60 * 60 * 1000
  );

  // update SLA state (move to next level)
  await conn.query(
    `UPDATE ticket_tat_state
SET level = ?, tat_hours = ?, started_at = ?, due_at = ?
WHERE ticket_id = ?

    `,
    [nextLevel.level, nextLevel.tat_hours, startedAt, dueAt, ticket.id]
  );

  // update ticket status
  await conn.query(
    `
  UPDATE tickets
SET status = 'ESCALATED',
assigned_to = NULL,
updated_at = NOW()
WHERE id = ?
    `,
    [ticket.id]
  );

  // status history
  await conn.query(
    `
    INSERT INTO ticket_status_history
      (ticket_id, old_status, new_status, changed_by)
    VALUES (?, ?, 'ESCALATED', ?)
    `,
    [ticket.id, ticket.status, actorId]
  );

  // optional remark
  if (reason) {
    await conn.query(
      `
      INSERT INTO ticket_remarks (ticket_id, remark, remarked_by)
      VALUES (?, ?, ?)
      `,
      [ticket.id, reason, actorId]
    );
  }
};
