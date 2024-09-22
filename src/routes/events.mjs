import { Router } from "express";
import { Event, Calendar } from "../models/index.js";

const router = Router();

// Obtener todos los eventos
// Obtener eventos
router.get("/api/events", async (req, res) => {
  try {
    // Obtener el userId desde la sesión
    const userId = req.session.userId;

    // Obtener el calendario (público o privado según el userId)
    const calendar = userId
      ? await Calendar.findOne({ user: userId }).populate("events")
      : await getOrCreatePublicCalendar();

    if (!calendar) {
      return res.status(404).json({ message: "Calendar not found" });
    }

    console.log(calendar);

    // Obtener y aplicar los filtros
    //const filters = buildEventFilters(req.query, calendar._id);

    // Consultar los eventos que cumplen con los filtros
    // const events = await Event.find(filters);

    console.log(calendar.events);
    // Devolver el calendario junto con sus eventos filtrados
    return res.json({
      calendar,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
});

// Función para obtener o crear el calendario público
async function getOrCreatePublicCalendar() {
  let publicCalendar = await Calendar.findOne({ isPublic: true }).populate(
    "events"
  );

  if (!publicCalendar) {
    publicCalendar = await Calendar.create({ isPublic: true, events: [] });
    console.log("Calendario público creado.");
  }

  return publicCalendar;
}

// Función para construir los filtros de eventos
// function buildEventFilters(query, calendarId) {
//   const { title, startDate, endDate, teacher, center, type, modality } = query;

//   console.log(query);

//   let filters = { calendarId }; // Filtrar por el calendario actual

//   if (title) filters.title = { $regex: title, $options: "i" };
//   if (startDate) filters.startDate = { $gte: new Date(startDate) };
//   if (endDate) filters.endDate = { $lte: new Date(endDate) };
//   if (teacher) filters.teacher = teacher;
//   if (center) filters.center = center;
//   if (type) filters.type = type;
//   if (modality) filters.modality = modality;

//   return filters;
// }

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
    const publicCalendar = await getOrCreatePublicCalendar();
    console.log(publicCalendar);

    if (calendar) {
      calendar.events.push(newEvent._id);
      await calendar.save();
    }

    if (publicCalendar) {
      publicCalendar.events.push(newEvent._id);
      await publicCalendar.save();
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
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    console.log(event);

    await Event.deleteOne({ _id: event._id });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
