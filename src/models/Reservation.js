import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  timeStart: { type: Date, required: true },
  timeEnd: { type: Date, required: true },
  durationMinutes: { type: Number, default: 120 },
  peopleCount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "accepted", "refused"], default: "pending" }
}, { timestamps: true });

export default mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);
