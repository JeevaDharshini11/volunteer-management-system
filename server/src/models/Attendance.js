import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["present", "absent"], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

attendanceSchema.index({ event: 1, volunteer: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
