import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["assigned", "in-progress", "completed"],
      default: "assigned"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
