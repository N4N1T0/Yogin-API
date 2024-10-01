import { Router } from "express";
import { Event, Calendar, Address, Center } from "../models/index.js";

const router = Router();

/* -------------------------------------------- MIDDLEWARES - FUNCIONES REUTILIZABLES -------------------------------------------- */
// 1) Función para buscar o crear una dirección
const prepareEventData = async (body) => {
  const {
    calendarId,
    title,
    startDate,
    endDate,
    teacherId,
    centerId,
    typeYoga,
    mode,
    participants,
    description,
    link,
    address,
  } = body;

  let addressId = null;

  console.log(centerId);

  if (centerId) {
    // Si hay un centerId, usamos la dirección del centro
    const center = await Center.findById(centerId).populate("address");
    if (!center) {
      throw new Error("Center not found");
    }
    addressId = center.address._id;
  } else if (mode === "Presencial" && address) {
    // Si es presencial y se proporciona una dirección, la usamos o creamos
    if (!address.location || !address.coordinates) {
      throw new Error(
        "Location and coordinates are required for a Presencial event without a center."
      );
    }
    const newAddress = await Address.findOneAndUpdate(
      { location: address.location, coordinates: address.coordinates },
      address,
      { upsert: true, new: true }
    );
    addressId = newAddress._id;
  }

  return {
    calendarId,
    title,
    startDate,
    endDate,
    teacherId,
    centerId: centerId || null,
    typeYoga,
    mode,
    participants,
    description: description || null,
    address: addressId,
    link: mode === "Online" ? link : null,
  };
};

// 2) Función para obtener o crear el calendario público
async function getOrCreatePublicCalendar() {
  let publicCalendar = await Calendar.findOne({ roleType: "public" }).populate({
    path: "events",
    populate: {
      path: "address",
      model: "Address",
    },
  });

  if (!publicCalendar) {
    publicCalendar = await Calendar.create({
      events: [],
      roleType: "public",
    });
    console.log("Calendario público creado.");
  }

  return publicCalendar;
}

/* -------------------------------------------- CRUD -------------------------------------------- */

// 1.1) SELECT - Obtener eventos
router.get("/api/events", async (req, res) => {
  try {
    const { userId } = req.session;
    const { roleType } = req.query; // Obtenemos roleType desde los parámetros de la consulta

    if (!roleType) {
      return res.status(400).json({ message: "roleType is required" });
    }

    // console.log("ROLETYPE:", roleType);

    let calendar;

    // Obtener el calendario según el roleType
    if (roleType === "public") {
      calendar = await getOrCreatePublicCalendar();
    } else if (userId) {
      calendar = await Calendar.findOne({
        user: userId,
        roleType: roleType,
      }).populate({
        path: "events",
        populate: {
          path: "address",
          model: "Address",
        },
      });
    } else {
      return res
        .status(403)
        .json({ message: "User not authorized to access private calendars." });
    }

    if (!calendar) {
      return res.status(404).json({ message: "Calendar not found" });
    }

    //console.log(calendar);

    // Devolver el calendario con sus eventos y la ubicación
    return res.json({
      calendar,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
});

// 1.2) SELECT (ID) - Obtener un evento por ID
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

// 2.1) CREATE - Crear un nuevo evento
router.post("/api/events", async (req, res) => {
  try {
    // Extraer y preparar los datos del evento
    const eventData = await prepareEventData(req.body);

    // Crear un nuevo evento con los datos preparados
    const newEvent = new Event(eventData);
    await newEvent.save();
    console.log(newEvent.calendarId);

    // Actualizar el calendario y el calendario público
    const calendar = await Calendar.findById(newEvent.calendarId);
    console.log(calendar);
    const publicCalendar = await getOrCreatePublicCalendar();

    if (calendar && calendar.roleType === "teacher") {
      calendar.events.push(newEvent._id);
      await calendar.save();
    } else {
      throw "No se pudo introducir el evento en el Calendario de profesor";
    }

    if (publicCalendar) {
      publicCalendar.events.push(newEvent._id);
      await publicCalendar.save();
    }

    const fullEvent = await Event.findById(newEvent._id).populate("address");

    res.status(201).json(fullEvent);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

// 2.2) CREATE - BOOKED EVENTS : Añadir evento a CALENDAR de Student
router.post("/api/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId, role } = req.session; // Usuario autenticado (de la sesión)

    // 1. Obtener el evento por ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const { participants } = event; // Número de participantes permitidos

    // 2. Contar cuántos estudiantes ya han reservado este evento
    const totalBookings = await Calendar.countDocuments({
      events: eventId, // Buscar estudiantes que ya tienen reservado este evento
      roleType: role,
    });

    // 3. Verificar si todavía hay espacio para nuevos participantes
    if (totalBookings >= participants) {
      return res.status(400).json({ message: "El evento está lleno" });
    }

    // 4. Obtener el calendario del estudiante (roleType: "STUDENT")
    const studentCalendar = await Calendar.findOne({
      user: userId,
      roleType: "student",
    });
    if (!studentCalendar) {
      return res
        .status(404)
        .json({ message: "Calendario del estudiante no encontrado" });
    }

    // 5. Verificar si el evento ya está reservado en el calendario del estudiante
    if (studentCalendar.events.includes(eventId)) {
      return res.status(400).json({ message: "Ya has reservado este evento" });
    }

    // 6. Añadir el evento al calendario del estudiante
    studentCalendar.events.push(eventId);
    await studentCalendar.save();

    return res
      .status(200)
      .json({ message: "Evento reservado con éxito", event });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// 3) UPDATE - Actualizar un evento por ID
router.patch("/api/events/:id", async (req, res) => {
  try {
    // Extraer y preparar los datos del evento
    const eventData = await prepareEventData(req.body);
    console.log(eventData);

    // Actualizar el evento con los nuevos datos
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true } // Para devolver el evento actualizado
    ).populate("address"); // Poblamos el campo 'address'

    console.log(updatedEvent);

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

// 4) DELETE - Eliminar un evento por ID
// Función para obtener los calendarios donde se debe eliminar el evento
async function getCalendarsToRemoveEvent(userId, userRole, eventId) {
  let conditions = { roleType: userRole, events: eventId }; // Condición base para todos los calendarios
  const calendars = [];

  // Añadir el calendario específico según el rol del usuario
  if (userRole !== "public") {
    conditions.user = userId;
  }

  // Buscar el calendario específico del usuario (profesor o estudiante)
  const userCalendar = await Calendar.findOne(conditions);
  if (userCalendar) calendars.push(userCalendar._id);

  // Añadir el calendario público solo si el rol es 'teacher'
  if (userRole === "teacher") {
    const publicCalendar = await Calendar.findOne(conditions);
    if (publicCalendar) calendars.push(publicCalendar._id);

    // Añadir los calendarios de los estudiantes que contienen el eventId
    delete conditions.user;
    const studentCalendars = await Calendar.find({
      role: "student",
      events: eventId,
    });
    calendars.push(...studentCalendars.map((cal) => cal._id));
  }

  return calendars;
}

// Función para eliminar el evento de los calendarios
async function removeEventFromCalendars(eventId, calendarIds) {
  await Calendar.updateMany(
    { _id: { $in: calendarIds } },
    { $pull: { events: eventId } }
  );
}

// Ruta DELETE para eliminar un evento por ID
router.delete("/api/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { userId, role } = req.session; // Usuario autenticado (de la sesión)

    // Obtener los calendarios relevantes basados en el rol del usuario y el eventId
    const calendarIds = await getCalendarsToRemoveEvent(userId, role, eventId);

    if (calendarIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No calendars found containing the event" });
    }

    // Eliminar el evento de los calendarios encontrados
    await removeEventFromCalendars(eventId, calendarIds);

    // Si es profesor, eliminar el evento completamente
    if (role === "teacher") {
      await Event.deleteOne({ _id: eventId });
      return res.json({ message: "Event deleted from all references" });
    }

    return res.json({ message: "Event removed from your calendar" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
