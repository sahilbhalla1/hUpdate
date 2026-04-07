const jwt = require("jsonwebtoken");
const db = require("../../config/db");

const CSAT_SECRET = process.env.CSAT_SECRET;

/* ------------------------------
   Verify CSAT token
------------------------------ */
function verifyToken(token) {
  return jwt.verify(token, CSAT_SECRET);
}

/* ------------------------------
   Fetch CSAT questions
------------------------------ */
exports.getQuestionsByToken = async (token) => {
  // const payload = verifyToken(token);

  const [[ticket]] = await db.query(
    `
    SELECT id, journey_id, csat_submitted
    FROM tickets
    WHERE id = ? AND csat_token = ?
    `,
    [8, token]
    // [payload.ticket_id, token]
  );

  if (!ticket) {
    throw new Error("Invalid or expired CSAT link");
  }

  if (ticket.csat_submitted) {
    throw new Error("CSAT already submitted");
  }

  const [rows] = await db.query(
    `
    SELECT 
      q.id,
      q.question_text,
      q.type,
      q.required,
      q.depends_on_question_id,
      q.depends_on_answer,
      o.option_value,
      o.option_label,
      o.option_order
    FROM csat_questions q
    LEFT JOIN csat_question_options o
      ON q.id = o.question_id
    WHERE q.journey_id = ?
    ORDER BY q.question_order, o.option_order
    `,
    [ticket.journey_id]
  );

  // Normalize
  const map = {};
  rows.forEach((r) => {
    if (!map[r.id]) {
      map[r.id] = {
        id: r.id,
        label: r.question_text,
        type: r.type,
        required: !!r.required,
        depends_on_question_id: r.depends_on_question_id,
        depends_on_answer: r.depends_on_answer,
        options: [],
      };
    }

    if (r.option_value) {
      map[r.id].options.push({
        value: r.option_value,
        label: r.option_label || r.option_value,
      });
    }
  });

  return Object.values(map);
};

/* ------------------------------
   Submit CSAT answers
------------------------------ */
exports.submitResponsesByToken = async (token, answers) => {
  // const payload = verifyToken(token);
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[ticket]] = await conn.query(
      `
      SELECT id, csat_submitted
      FROM tickets
      WHERE id = ? AND csat_token = ?
      FOR UPDATE
      `,
      [8, token]
      // [payload.ticket_id, token]
    );

    if (!ticket) {
      throw new Error("Invalid CSAT token");
    }

    if (ticket.csat_submitted) {
      throw new Error("CSAT already submitted");
    }

    for (const a of answers) {
      await conn.query(
        `
        INSERT INTO csat_responses
          (ticket_id, question_id, answer)
        VALUES (?, ?, ?)
        `,
        [
          ticket.id,
          a.question_id,
          JSON.stringify(a.answer),
        ]
      );
    }

    await conn.query(
      `
      UPDATE tickets
      SET csat_submitted = 1
      WHERE id = ?
      `,
      [ticket.id]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
