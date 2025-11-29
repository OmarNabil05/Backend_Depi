// Backend/Backend/src/models/Table.js
import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  maxSeats: { type: Number, required: true },
  reserved: { type: Boolean, default: false }
});

// ✅ هذا يحمي من إعادة التعريف
const Table = mongoose.models.Table || mongoose.model("Table", tableSchema);

export default Table;
