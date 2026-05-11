import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import Event from "../models/Event.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const events = await Event.find()
    .populate("registeredVolunteers", "name email skills")
    .sort({ date: 1 });
  res.json(events);
});

router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", protect, requireAdmin, async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json(event);
});

router.post("/:id/register", protect, async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  if (!event.registeredVolunteers.includes(req.user._id)) {
    event.registeredVolunteers.push(req.user._id);
    await event.save();
  }

  res.json(event);
});

router.post("/:id/cancel", protect, async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  event.registeredVolunteers = event.registeredVolunteers.filter(
    (volunteerId) => volunteerId.toString() !== req.user._id.toString()
  );
  await event.save();

  res.json(event);
});

router.delete("/:id", protect, requireAdmin, async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json({ message: "Event deleted" });
});

export default router;
