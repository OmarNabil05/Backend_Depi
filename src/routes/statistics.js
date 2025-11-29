import express from "express";
import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const now = new Date();

    // Total reservations
    const totalReservations = await Reservation.countDocuments();

    // Accepted reservations
    const acceptedReservations = await Reservation.find({ status: "accepted" });

    // Example revenue: $50 per person (replace with real menu totals if needed)
    const revenue = acceptedReservations.reduce((sum, r) => sum + r.peopleCount * 50, 0);

    // Tables currently in use
    const tablesInUse = await Reservation.find({
      status: "accepted",
      timeStart: { $lte: now },
      timeEnd: { $gt: now }
    }).distinct("table");

    // Top menu items placeholder (replace with real analytics if you have orders)
    const topMenuItems = await MenuItem.find().limit(5);

    res.json({
      totalReservations,
      revenue,
      tablesInUse: tablesInUse.length,
      topMenuItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
