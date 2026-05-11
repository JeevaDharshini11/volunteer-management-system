import express from "express";
import { mapUser, pool } from "../config/db.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, requireAdmin, async (req, res) => {
  const { skill, availability, status } = req.query;
  const values = [];
  const conditions = ["role = 'volunteer'"];

  if (skill) {
    values.push(`%${skill}%`);
    conditions.push(`exists (select 1 from unnest(skills) item where item ilike $${values.length})`);
  }

  if (availability) {
    values.push(`%${availability}%`);
    conditions.push(`exists (select 1 from unnest(availability) item where item ilike $${values.length})`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const { rows } = await pool.query(
    `select * from users where ${conditions.join(" and ")} order by created_at desc`,
    values
  );

  res.json(rows.map(mapUser));
});

router.put("/:id/status", protect, requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `update users
     set status = $1, updated_at = now()
     where id = $2 and role = 'volunteer'
     returning *`,
    [req.body.status, req.params.id]
  );

  if (!rows[0]) {
    return res.status(404).json({ message: "Volunteer not found" });
  }

  res.json(mapUser(rows[0]));
});

router.put("/profile", protect, async (req, res) => {
  const { name, phone, skills, availability, experience } = req.body;
  const { rows } = await pool.query(
    `update users
     set name = coalesce($1, name),
         phone = coalesce($2, phone),
         skills = coalesce($3, skills),
         availability = coalesce($4, availability),
         experience = coalesce($5, experience),
         updated_at = now()
     where id = $6
     returning *`,
    [
      name ?? null,
      phone ?? null,
      Array.isArray(skills) ? skills : null,
      Array.isArray(availability) ? availability : null,
      experience ?? null,
      req.user._id
    ]
  );

  res.json(mapUser(rows[0]));
});

router.delete("/:id", protect, requireAdmin, async (req, res) => {
  const { rowCount } = await pool.query("delete from users where id = $1 and role = 'volunteer'", [req.params.id]);

  if (!rowCount) {
    return res.status(404).json({ message: "Volunteer not found" });
  }

  res.json({ message: "Volunteer removed" });
});

export default router;
