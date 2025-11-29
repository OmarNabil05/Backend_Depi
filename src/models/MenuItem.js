import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  category: { type: String, required: true }, // static categories: e.g., "Appetizers", "Main Course", "Desserts"
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  photoUrl: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
