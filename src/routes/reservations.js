import express from "express";
import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";

const router = express.Router();

// CREATE reservation (with time overlap check)
router.post("/", async (req, res) => {
  try {
    const { customerName, tableId, timeStart, durationMinutes = 120, peopleCount } = req.body;

    if (!customerName || !tableId || !timeStart || !peopleCount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ error: "Table not found" });

    const start = new Date(timeStart);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    // Check overlapping reservations
    const overlapping = await Reservation.findOne({
      table: tableId,
      status: { $in: ["pending", "accepted"] },
      $or: [{ timeStart: { $lt: end }, timeEnd: { $gt: start } }]
    });

    if (overlapping) return res.status(400).json({ error: "Table is already reserved at this time" });

    const reservation = await Reservation.create({
      customerName,
      table: tableId,
      timeStart: start,
      timeEnd: end,
      durationMinutes,
      peopleCount,
      status: "pending"
    });

    // Emit socket event
    const io = req.app.get("io");
    io?.emit("reservationsUpdated");

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reservations (optional status filter)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reservations = await Reservation.find(filter).populate("table");
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET log (accepted/refused)
router.get("/log", async (req, res) => {
  try {
    const reservations = await Reservation.find({ status: { $in: ["accepted", "refused"] } }).populate("table");
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE reservation (full update: status, table, time, people count)
router.put("/:id", async (req, res) => {
  try {
    const { status, tableId, timeStart, durationMinutes, peopleCount } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Reservation not found" });

    // Determine new values
    let start = timeStart ? new Date(timeStart) : reservation.timeStart;
    let dur = durationMinutes || reservation.durationMinutes;
    let end = new Date(start.getTime() + dur * 60 * 1000);
    let table = tableId || reservation.table;

    // Overlap check if time or table changed
    const overlapping = await Reservation.findOne({
      table,
      status: { $in: ["pending", "accepted"] },
      _id: { $ne: reservation._id },
      $or: [{ timeStart: { $lt: end }, timeEnd: { $gt: start } }]
    });
    if (overlapping) return res.status(400).json({ error: "Table is already reserved at this time" });

    // Apply updates
    if (status) reservation.status = status;
    reservation.timeStart = start;
    reservation.durationMinutes = dur;
    reservation.timeEnd = end;
    reservation.table = table;
    if (peopleCount) reservation.peopleCount = peopleCount;

    await reservation.save();

    const io = req.app.get("io");
    io?.emit("reservationsUpdated");

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE reservation
router.delete("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Reservation not found" });

    const io = req.app.get("io");
    io?.emit("reservationsUpdated");

    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
