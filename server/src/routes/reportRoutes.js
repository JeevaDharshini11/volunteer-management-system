import express from "express";
import { pool } from "../config/db.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/summary", protect, requireAdmin, async (req, res) => {
  const [totalVolunteers, pendingVolunteers, activeEvents, completedTasks, attendance] = await Promise.all([
    pool.query("select count(*)::int as count from users where role = 'volunteer'"),
    pool.query("select count(*)::int as count from users where role = 'volunteer' and status = 'pending'"),
    pool.query("select count(*)::int as count from events where date >= now()"),
    pool.query("select count(*)::int as count from tasks where status = 'completed'"),
    pool.query("select status as _id, count(*)::int as count from attendance group by status")
  ]);

  res.json({
    totalVolunteers: totalVolunteers.rows[0].count,
    pendingVolunteers: pendingVolunteers.rows[0].count,
    activeEvents: activeEvents.rows[0].count,
    completedTasks: completedTasks.rows[0].count,
    attendance: attendance.rows
  });
});

export default router;
