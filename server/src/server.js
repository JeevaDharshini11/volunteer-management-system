import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Volunteer Management API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error" });
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
