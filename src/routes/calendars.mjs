import { Router } from "express";
import { Calendar } from "../models/index.js";

const router = Router();

// Obtener todos los calendarios
router.get("/api/calendars", async (req, res) => {
  try {
    const calendars = await Calendar.find();
    res.json(calendars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo calendario
router.post("/api/calendars", async (req, res) => {
  const calendar = new Calendar({
    name: req.body.name,
    bgColor: req.body.bgColor,
    borderColor: req.body.borderColor,
  });

  try {
    const newCalendar = await calendar.save();
    res.status(201).json(newCalendar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener un calendario por ID
router.get("/api/calendars/:id", async (req, res) => {
  try {
    const calendar = await Calendar.findById(req.params.id);
    if (calendar == null) {
      return res.status(404).json({ message: "Calendar not found" });
    }
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un calendario por ID
router.patch("/api/calendars/:id", async (req, res) => {
  try {
    const updatedCalendar = await Calendar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (updatedCalendar == null) {
      return res.status(404).json({ message: "Calendar not found" });
    }
    res.json(updatedCalendar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un calendario por ID
router.delete("/api/calendars/:id", async (req, res) => {
  try {
    const calendar = await Calendar.findById(req.params.id);
    if (calendar == null) {
      return res.status(404).json({ message: "Calendar not found" });
    }
    await calendar.remove();
    res.json({ message: "Calendar deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
