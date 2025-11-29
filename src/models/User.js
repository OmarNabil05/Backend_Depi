import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["user", "admin", "staff"], default: "user" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);
