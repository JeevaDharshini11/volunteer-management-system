import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

router.get("/", protect, requireAdmin, async (req, res) => {
  const records = await Attendance.find()
    .populate("event", "title date")
    .populate("volunteer", "name email")
    .sort({ createdAt: -1 });
  res.json(records);
});

router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const record = await Attendance.findOneAndUpdate(
      { event: req.body.event, volunteer: req.body.volunteer },
      { ...req.body, markedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
