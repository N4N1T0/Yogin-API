import { Router } from "express";
import { Event, Calendar, Address } from "../models/index.js";

const router = Router();

// Obtener todos los eventos
// Obtener eventos
router.get("/api/events", async (req, res) => {
  try {
    const { userId } = req.session;
    const { roleType } = req.query; // Obtenemos roleType desde los parámetros de la consulta

    if (!roleType) {
      return res.status(400).json({ message: "roleType is required" });
    }

    console.log("ROLETYPE:", roleType);

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
          path: "addressId",
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

// Función para obtener o crear el calendario público
async function getOrCreatePublicCalendar() {
  let publicCalendar = await Calendar.findOne({ roleType: "public" }).populate({
    path: "events",
    populate: {
      path: "addressId",
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

// Función para buscar o crear una dirección
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

  let newAddress = null;

  // Manejar la creación/búsqueda de dirección si el evento es presencial y no tiene un centro
  if (mode === "Presencial" && !centerId) {
    if (!address.location || !address.coordinates) {
      throw new Error(
        "Location and coordinates are required for a Presencial event without a center."
      );
    }

    //console.log(address);

    newAddress = await Address.findOrCreate(address);
  }

  // Retornar el objeto completo con todas las propiedades ya procesadas
  return {
    calendarId,
    title,
    startDate,
    endDate,
    teacherId,
    centerId: centerId || null, // Si no hay centerId, será null
    typeYoga,
    mode,
    participants,
    description: description || null, // Descripción opcional
    addressId: newAddress ? newAddress._id : undefined, // Si hay una nueva dirección
    link: mode === "Online" ? link : undefined, // Solo incluir link para eventos en línea
  };
};

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
  try {
    // Extraer y preparar los datos del evento
    const eventData = await prepareEventData(req.body);

    // Crear un nuevo evento con los datos preparados
    const newEvent = new Event(eventData);
    await newEvent.save();

    // Actualizar el calendario y el calendario público
    const calendar = await Calendar.findById(eventData.calendarId);
    const publicCalendar = await getOrCreatePublicCalendar();

    if (calendar) {
      calendar.events.push(newEvent._id);
      await calendar.save();
    }

    if (publicCalendar) {
      publicCalendar.events.push(newEvent._id);
      await publicCalendar.save();
    }

    //newEvent.populate("addressId");

    res.status(201).json(newEvent /*.populate("addressId")*/);
  } catch (error) {
    //console.log(error);
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
// Actualizar un evento por ID
router.patch("/api/events/:id", async (req, res) => {
  try {
    // Extraer y preparar los datos del evento
    const eventData = await prepareEventData(req.body);

    // Actualizar el evento con los nuevos datos
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true } // Para devolver el evento actualizado
    ).populate("addressId"); // Poblamos el campo 'address'

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(updatedEvent);
  } catch (error) {
    //console.log(error);
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

    //console.log(event);

    await Event.deleteOne({ _id: event._id });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
