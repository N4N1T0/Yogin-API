import { Router } from "express";
import { Teacher } from "../models/index.js";

const router = Router();

router.get("/api/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("user", "name"); // Obtén el 'name' del User relacionado

    console.log(teachers); // Muestra todos los datos del Teacher y el 'name' del User
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener profesores", error });
  }
});

export default router;
