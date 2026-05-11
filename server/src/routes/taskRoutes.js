import express from "express";
import { pool } from "../config/db.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function mapTask(row) {
  return {
    _id: row.id,
    title: row.title,
    description: row.description || "",
    status: row.status,
    event: row.event_id
      ? {
          _id: row.event_id,
          title: row.event_title,
          date: row.event_date,
          location: row.event_location
        }
      : undefined,
    volunteer: row.volunteer_id
      ? {
          _id: row.volunteer_id,
          name: row.volunteer_name,
          email: row.volunteer_email,
          skills: row.volunteer_skills || []
        }
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get("/", protect, async (req, res) => {
  const values = [];
  const where = req.user.role === "admin" ? "" : "where t.volunteer_id = $1";

  if (req.user.role !== "admin") {
    values.push(req.user._id);
  }

  const { rows } = await pool.query(
    `select t.*,
            e.title as event_title,
            e.date as event_date,
            e.location as event_location,
            u.name as volunteer_name,
            u.email as volunteer_email,
            u.skills as volunteer_skills
     from tasks t
     join events e on e.id = t.event_id
     join users u on u.id = t.volunteer_id
     ${where}
     order by t.created_at desc`,
    values
  );

  res.json(rows.map(mapTask));
});

router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const { title, description, event, volunteer } = req.body;
    const { rows } = await pool.query(
      `insert into tasks (title, description, event_id, volunteer_id)
       values ($1, $2, $3, $4)
       returning *`,
      [title, description || null, event, volunteer]
    );

    res.status(201).json(mapTask(rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  const status = req.body.status;
  const query =
    req.user.role === "admin"
      ? `update tasks set status = coalesce($1, status), updated_at = now() where id = $2 returning *`
      : `update tasks set status = $1, updated_at = now() where id = $2 and volunteer_id = $3 returning *`;
  const values = req.user.role === "admin" ? [status ?? null, req.params.id] : [status, req.params.id, req.user._id];
  const { rows } = await pool.query(query, values);

  if (!rows[0]) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json(mapTask(rows[0]));
});

export default router;
