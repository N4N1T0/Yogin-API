import { Router } from "express";
import { Address } from "../models/index.js"; // Asegúrate de que los modelos estén correctamente importados

const router = Router();

router.get("/api/addresses", async (req, res) => {
  try {
    // Hacemos una agregación para encontrar todas las direcciones que están siendo utilizadas en eventos
    const usedAddresses = await Address.aggregate([
      {
        $lookup: {
          from: "events", // Nombre de la colección de eventos
          localField: "_id", // El campo de `address` en los eventos hace referencia a este `_id`
          foreignField: "address", // Campo de referencia en la colección de eventos
          as: "relatedEvents", // Nombre del array donde se guardarán los eventos relacionados
        },
      },
      {
        $match: {
          "relatedEvents.0": { $exists: true }, // Filtramos las direcciones que tengan al menos un evento relacionado
        },
      },
    ]);

    res.json(usedAddresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener las direcciones utilizadas en eventos",
    });
  }
});

export default router;
