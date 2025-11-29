// Backend/Backend/src/routes/tables.js
import express from "express";
import Table from "../models/Table.js"; // هنا فقط

const router = express.Router();

// GET كل الطاولات
router.get("/", async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST إضافة طاولة جديدة
router.post("/", async (req, res) => {
  try {
    const { name, category, maxSeats } = req.body;
    const newTable = new Table({ name, category, maxSeats });
    await newTable.save();

    // Socket.IO
    const io = req.app.get("io");
    io.emit("tableAdded", newTable);

    res.json(newTable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT تعديل طاولة
router.put("/:id", async (req, res) => {
  try {
    const { name, category, maxSeats, reserved } = req.body;
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { name, category, maxSeats, reserved },
      { new: true }
    );

    const io = req.app.get("io");
    io.emit("tableUpdated", table);

    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE حذف طاولة
router.delete("/:id", async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);

    const io = req.app.get("io");
    io.emit("tableDeleted", req.params.id);

    res.json({ message: "Table deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
