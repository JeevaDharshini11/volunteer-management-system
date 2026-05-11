import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import Attendance from "../models/Attendance.js";
import Event from "../models/Event.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/summary", protect, requireAdmin, async (req, res) => {
  const [totalVolunteers, pendingVolunteers, activeEvents, completedTasks, attendance] = await Promise.all([
    User.countDocuments({ role: "volunteer" }),
    User.countDocuments({ role: "volunteer", status: "pending" }),
    Event.countDocuments({ date: { $gte: new Date() } }),
    Task.countDocuments({ status: "completed" }),
    Attendance.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
  ]);

  res.json({
    totalVolunteers,
    pendingVolunteers,
    activeEvents,
    completedTasks,
    attendance
  });
});

export default router;
