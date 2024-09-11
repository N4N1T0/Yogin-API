import { Router } from "express";
import { Event, Calendar } from "../models/index.js";

const router = Router();

// Obtener todos los eventos
// Obtener eventos
router.get("/api/events", async (req, res) => {
  try {
    // Buscar el calendario público
    let publicCalendar = await Calendar.findOne({ isPublic: true }).populate(
      "events"
    );

    // Si no existe el calendario público, créalo
    if (!publicCalendar) {
      publicCalendar = await Calendar.create({
        isPublic: true,
        events: [],
      });
      console.log("Calendario público creado.");
    }

    // Obtener el userId desde la sesión
    const userId = req.session.userId;

    if (!userId) {
      // Si no hay sesión de usuario, devolver el calendario público
      return res.json(publicCalendar);
    } else {
      // Buscar el calendario asociado al userId
      const userCalendar = await Calendar.findOne({ user: userId }).populate(
        "events"
      );

      if (!userCalendar) {
        return res.status(404).json({ message: "Calendar not found" });
      }

      // Devolver el calendario privado junto con sus eventos
      const calendar = {
        calendar: userCalendar,
        events: userCalendar.events,
      };

      return res.json(calendar);
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
});

// Crear un nuevo evento
router.post("/api/events", async (req, res) => {
  console.log(req.body);
  const event = new Event({
    calendarId: req.body.calendarId,
    title: req.body.title,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    teacherId: req.body.teacherId,
    centerId: req.body.centerId,
    typeYoga: req.body.typeYoga,
    mode: req.body.mode,
    participants: req.body.participants,
    description: req.body.description,
  });

  try {
    const newEvent = await event.save();
    const calendar = await Calendar.findById(req.body.calendarId);
    if (calendar) {
      calendar.events.push(newEvent._id);
      await calendar.save();
    }
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener un evento por ID
router.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id); // Cambiado a req.params.id
    if (!event) {
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
