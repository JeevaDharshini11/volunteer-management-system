import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

function sanitizeUser(user) {
  const plain = user.toObject();
  delete plain.password;
  return plain;
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, skills, availability, experience, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role === "admin" ? "admin" : "volunteer",
      status: role === "admin" ? "approved" : "pending",
      skills,
      availability,
      experience
    });

    res.status(201).json({
      user: sanitizeUser(user),
      token: createToken(user)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your registration was rejected" });
    }

    res.json({
      user: sanitizeUser(user),
      token: createToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
