import { Router } from "express";

const router = Router();

const Calendar = require("../models/Calendar");

// Obtener todos los calendarios
router.get("/api/calendar", async (req, res) => {
  try {
    const calendars = await Calendar.find();
    res.json(calendars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo calendario
router.post("/api/calendar", async (req, res) => {
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

router.put("/api/calendar/:id", async (req, res) => {
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

router.delete("/api/calendar/:id", async (req, res) => {
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

module.exports = router;
