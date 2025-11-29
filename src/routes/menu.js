import express from "express";
import MenuItem from "../models/MenuItem.js";

const router = express.Router();

// CREATE Menu Item
router.post("/", async (req, res) => {
  try {
    const { category, name, description, price, photoUrl } = req.body;
    if (!category || !name || !description || !price || !photoUrl) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const menuItem = await MenuItem.create({ category, name, description, price, photoUrl });
    res.status(201).json(menuItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all menu items
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE menu item
router.put("/:id", async (req, res) => {
  try {
    const { category, name, description, price, photoUrl } = req.body;
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { category, name, description, price, photoUrl },
      { new: true }
    );
    if (!menuItem) return res.status(404).json({ error: "Menu item not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE menu item
router.delete("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) return res.status(404).json({ error: "Menu item not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
