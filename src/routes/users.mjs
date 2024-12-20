import { Router } from "express";
import { validationResult, checkSchema, matchedData } from "express-validator";
import {
  createUserValidationSchema,
  resolveUserById,
  setCookies,
} from "../utils/index.mjs";
import {
  User,
  Student,
  Teacher,
  Center,
  Calendar,
  Address,
} from "../models/index.js";
import { generateJWT } from "../utils/auth-utils.mjs";
import passport from "../strategies/jwt-strategy.mjs";

const router = Router();

// 1. GET Users
router.get(
  "/api/users",
  checkSchema(createUserValidationSchema(3, 10)),
  async (req, res) => {
    const result = validationResult(req);

    // Validar si hay errores en la solicitud
    if (result.isEmpty() === false) {
      return res
        .status(400)
        .json({ errors: result.array().flatMap((e) => e.msg) });
    }

    // Obtener los parámetros de la solicitud
    const { filter, value } = req.query;

    try {
      if (filter && value) {
        const filterQuery = {};
        filterQuery[filter] = { $regex: value, $options: "i" }; // $regex para hacer búsqueda insensible a mayúsculas y minúsculas

        const users = await User.find(filterQuery);

        return res.status(200).json(users);
      } else {
        const users = await User.find(); // Si no hay filtros, obtenemos todos los usuarios
        return res.status(200).json(users);
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error al obtener los usuarios",
        error: error.message,
      });
    }
  }
);

// 2. GET User by ID
router.get("/api/users/:id", resolveUserById, async (req, res) => {
  const { userId } = req;

  try {
    // Buscar el usuario en la base de datos por el ID
    const user = await User.findById(userId);

    // Si no se encuentra el usuario
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Devuelve el usuario encontrado
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener el usuario", error: error.message });
  }
});

// 3. POST (Create User)
router.post(
  "/api/users",
  checkSchema(createUserValidationSchema),
  async (req, res) => {
    // Validar el cuerpo de la solicitud
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(404).end({ errors: result.array() });

    // Obtener los datos validados
    const data = matchedData(req);

    try {
      // Crear un nuevo usuario en la base de datos
      const newUser = await User.create(data);

      return res.status(201).json({
        message: "Usuario creado con éxito",
        user: newUser,
      });
    } catch (error) {
      // Manejo de errores
      return res
        .status(500)
        .json({ message: "Error al crear el usuario", error: error.message });
    }
  }
);

// 4. PUT (Update User)
router.put("/api/users/:id", resolveUserById, async (req, res) => {
  const { body, userId } = req;

  try {
    // Actualizar el usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(userId, body, {
      new: true, // Devuelve el documento actualizado
      runValidators: true, // Ejecuta las validaciones de Mongoose
    });

    // Si no se encuentra el usuario
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Devuelve el usuario actualizado
    return res.status(200).json({
      message: "Usuario actualizado con éxito",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
});

// 5. PATCH (Update Some Fields)
router.patch("/api/users/:id", resolveUserById, async (req, res) => {
  const { body, userId } = req;

  try {
    // Actualizar el usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId, // ID del usuario
      { $set: body }, // Los campos que se desean actualizar ---> configurar el $set
      { new: true } // Para devolver el documento actualizado
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "No se pudo actualizar el usuario" });
    }

    // Responder con el usuario actualizado
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return res.status(500).json({ message: "Error al actualizar el usuario" });
  }
});

// 6. DELETE (Remove User)
router.delete("/api/users/:id", resolveUserById, async (req, res) => {
  const { userId } = req;

  try {
    // Elimina al usuario de la base de datos
    await User.deleteOne({ _id: userId });

    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al eliminar el usuario", error });
  }
});

// 7. Ruta de registro
router.post(
  "/api/register",
  checkSchema(createUserValidationSchema),
  async (req, res) => {
    try {
      const { name, email, password, role, address } = req.body;
      const dbUser = await User.findOne({ email });

      if (dbUser) {
        return res.status(401).send({ message: "ERROR. Usuario preexistente" });
      }

      const newUser = new User({ name, email, password, role });
      await newUser.save();

      const roles = [];
      if (role === "teacher" || role === "student") {
        if (role === "teacher") {
          await Teacher.create({ user: newUser._id });
          roles.push("teacher");
        }
        await Student.create({ user: newUser._id });
        roles.push("student");
      } else if (role === "center") {
        const newAddress = await Address.findOrCreate(address);
        await Center.create({ user: newUser._id, address: newAddress });
        roles.push("center");
      }

      for (const roleType of roles) {
        await Calendar.create({ roleType: roleType, user: newUser._id });
      }

      // Generar el token JWT usando la función de generación de JWT
      const token = generateJWT(newUser);

      // Establecer el token JWT en la cookie
      setCookies(req, res, token);

      res.status(201).json({
        message: "Usuario registrado con éxito",
        user: {
          userId: newUser.userId,
          role: newUser.role,
          initialRole: newUser.role,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// 8. Ruta de login
router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar el token JWT usando la función de generación de JWT
    const token = generateJWT(user);

    // Establecer el token JWT en la cookie
    setCookies(req, res, token);

    res.status(200).json({
      message: "Login exitoso",
      user: {
        userId: user._id,
        role: user.role,
        initialRole: user.role,
      },
      // NO hace falta el token, ya esta en las cookies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 9. Verificar sesión con Passport
router.get(
  "/api/session",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await req.user; // El usuario está en `req.user` gracias a Passport

    if (!user) {
      return res.status(401).json({ message: "No hay sesión iniciada" });
    }

    res.json({
      userId: user._id,
      role: user.role,
      initialRole: user.role,
    });
  }
);

// 10. Logout
router.post("/api/logout", (_req, res) => {
  try {
    // Limpia las cookies asociadas al JWT
    res.clearCookie("sessionToken");

    // Puedes también enviar una respuesta indicando éxito
    res.status(200).json({ message: "Sesión cerrada con éxito" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({ message: "Error al cerrar sesión" });
  }
});

export default router;
