import { Router } from "express";
import { Center } from "../models/index.js";

const router = Router();

router.get("/api/centers", async (req, res) => {
  try {
    const centers = await Center.find().populate("user", "name"); // Obtén el 'name' del User relacionado

    res.json(centers);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener centros" });
  }
});

export default router;
