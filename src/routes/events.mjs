import { Router } from "express";
import Event from "../models/event.model.js";

const router = Router();

// Obtener todos los eventos
router.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().populate("calendarId");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo evento
router.post("/api/events", async (req, res) => {
  const event = new Event({
    calendarId: req.body.calendarId,
    title: req.body.title,
    start: req.body.start,
    end: req.body.end,
    isAllDay: req.body.isAllDay,
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener un evento por ID
router.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("calendarId");
    if (event == null) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un evento por ID
router.patch("/api/events/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (updatedEvent == null) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un evento por ID
router.delete("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event == null) {
      return res.status(404).json({ message: "Event not found" });
    }
    await event.remove();
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
