import express from "express";
import { pool } from "../config/db.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function mapAttendance(row) {
  return {
    _id: row.id,
    status: row.status,
    notes: row.notes || "",
    event: {
      _id: row.event_id,
      title: row.event_title,
      date: row.event_date
    },
    volunteer: {
      _id: row.volunteer_id,
      name: row.volunteer_name,
      email: row.volunteer_email
    },
    markedBy: row.marked_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get("/", protect, requireAdmin, async (req, res) => {
  const { rows } = await pool.query(`
    select a.*,
           e.title as event_title,
           e.date as event_date,
           u.name as volunteer_name,
           u.email as volunteer_email
    from attendance a
    join events e on e.id = a.event_id
    join users u on u.id = a.volunteer_id
    order by a.created_at desc
  `);

  res.json(rows.map(mapAttendance));
});

router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const { event, volunteer, status, notes } = req.body;
    const { rows } = await pool.query(
      `insert into attendance (event_id, volunteer_id, status, notes, marked_by)
       values ($1, $2, $3, $4, $5)
       on conflict (event_id, volunteer_id)
       do update set status = excluded.status,
                     notes = excluded.notes,
                     marked_by = excluded.marked_by,
                     updated_at = now()
       returning *`,
      [event, volunteer, status, notes || null, req.user._id]
    );

    res.status(201).json(mapAttendance(rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
