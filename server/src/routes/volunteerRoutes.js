import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", protect, requireAdmin, async (req, res) => {
  const { skill, availability, status } = req.query;
  const query = { role: "volunteer" };

  if (skill) query.skills = { $regex: skill, $options: "i" };
  if (availability) query.availability = { $regex: availability, $options: "i" };
  if (status) query.status = status;

  const volunteers = await User.find(query).select("-password").sort({ createdAt: -1 });
  res.json(volunteers);
});

router.put("/:id/status", protect, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const volunteer = await User.findOneAndUpdate(
    { _id: req.params.id, role: "volunteer" },
    { status },
    { new: true, runValidators: true }
  ).select("-password");

  if (!volunteer) {
    return res.status(404).json({ message: "Volunteer not found" });
  }

  res.json(volunteer);
});

router.put("/profile", protect, async (req, res) => {
  const allowed = ["name", "phone", "skills", "availability", "experience"];
  const updates = {};

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const volunteer = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  }).select("-password");

  res.json(volunteer);
});

router.delete("/:id", protect, requireAdmin, async (req, res) => {
  const volunteer = await User.findOneAndDelete({ _id: req.params.id, role: "volunteer" });

  if (!volunteer) {
    return res.status(404).json({ message: "Volunteer not found" });
  }

  res.json({ message: "Volunteer removed" });
});

export default router;
