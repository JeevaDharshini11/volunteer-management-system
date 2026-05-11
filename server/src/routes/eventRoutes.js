import express from "express";
import { pool } from "../config/db.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function mapEvent(row) {
  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    location: row.location,
    requiredVolunteers: row.required_volunteers,
    createdBy: row.created_by,
    registeredVolunteers: row.registered_volunteers || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get("/", protect, async (req, res) => {
  const { rows } = await pool.query(`
    select e.*,
      coalesce(
        json_agg(
          json_build_object('_id', u.id, 'name', u.name, 'email', u.email, 'skills', u.skills)
        ) filter (where u.id is not null),
        '[]'
      ) as registered_volunteers
    from events e
    left join event_registrations er on er.event_id = e.id
    left join users u on u.id = er.volunteer_id
    group by e.id
    order by e.date asc
  `);

  res.json(rows.map(mapEvent));
});

router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, requiredVolunteers } = req.body;
    const { rows } = await pool.query(
      `insert into events (title, description, date, location, required_volunteers, created_by)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [title, description, date, location, requiredVolunteers, req.user._id]
    );

    res.status(201).json(mapEvent({ ...rows[0], registered_volunteers: [] }));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", protect, requireAdmin, async (req, res) => {
  const { title, description, date, location, requiredVolunteers } = req.body;
  const { rows } = await pool.query(
    `update events
     set title = coalesce($1, title),
         description = coalesce($2, description),
         date = coalesce($3, date),
         location = coalesce($4, location),
         required_volunteers = coalesce($5, required_volunteers),
         updated_at = now()
     where id = $6
     returning *`,
    [title ?? null, description ?? null, date ?? null, location ?? null, requiredVolunteers ?? null, req.params.id]
  );

  if (!rows[0]) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json(mapEvent({ ...rows[0], registered_volunteers: [] }));
});

router.post("/:id/register", protect, async (req, res) => {
  const event = await pool.query("select * from events where id = $1", [req.params.id]);

  if (!event.rows[0]) {
    return res.status(404).json({ message: "Event not found" });
  }

  await pool.query(
    "insert into event_registrations (event_id, volunteer_id) values ($1, $2) on conflict do nothing",
    [req.params.id, req.user._id]
  );

  res.json(mapEvent({ ...event.rows[0], registered_volunteers: [] }));
});

router.post("/:id/cancel", protect, async (req, res) => {
  const event = await pool.query("select * from events where id = $1", [req.params.id]);

  if (!event.rows[0]) {
    return res.status(404).json({ message: "Event not found" });
  }

  await pool.query("delete from event_registrations where event_id = $1 and volunteer_id = $2", [
    req.params.id,
    req.user._id
  ]);

  res.json(mapEvent({ ...event.rows[0], registered_volunteers: [] }));
});

router.delete("/:id", protect, requireAdmin, async (req, res) => {
  const { rowCount } = await pool.query("delete from events where id = $1", [req.params.id]);

  if (!rowCount) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json({ message: "Event deleted" });
});

export default router;
