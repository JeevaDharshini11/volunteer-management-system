import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import Task from "../models/Task.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const query = req.user.role === "admin" ? {} : { volunteer: req.user._id };
  const tasks = await Task.find(query)
    .populate("event", "title date location")
    .populate("volunteer", "name email skills")
    .sort({ createdAt: -1 });
  res.json(tasks);
});

router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  const query = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, volunteer: req.user._id };
  const allowedUpdates = req.user.role === "admin" ? req.body : { status: req.body.status };

  const task = await Task.findOneAndUpdate(query, allowedUpdates, {
    new: true,
    runValidators: true
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json(task);
});

export default router;
