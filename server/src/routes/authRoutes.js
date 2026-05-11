import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { mapUser, pool } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, skills, availability, experience, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const normalizedRole = role === "admin" ? "admin" : "volunteer";
    const status = normalizedRole === "admin" ? "approved" : "pending";

    const { rows } = await pool.query(
      `insert into users (name, email, password_hash, phone, role, status, skills, availability, experience)
       values ($1, lower($2), $3, $4, $5, $6, $7, $8, $9)
       returning *`,
      [
        name,
        email,
        passwordHash,
        phone || null,
        normalizedRole,
        status,
        Array.isArray(skills) ? skills : [],
        Array.isArray(availability) ? availability : [],
        experience || null
      ]
    );

    const user = mapUser(rows[0]);

    res.status(201).json({
      user,
      token: createToken(user)
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email is already registered" });
    }

    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query("select * from users where email = lower($1)", [email]);
    const dbUser = rows[0];

    if (!dbUser || !(await bcrypt.compare(password, dbUser.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (dbUser.status === "rejected") {
      return res.status(403).json({ message: "Your registration was rejected" });
    }

    const user = mapUser(dbUser);

    res.json({
      user,
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
