import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["admin", "volunteer"], default: "volunteer" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    skills: [{ type: String, trim: true }],
    availability: [{ type: String, trim: true }],
    experience: { type: String, trim: true },
    participationHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
