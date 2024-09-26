import { Router } from "express";
import { validationResult, checkSchema, matchedData } from "express-validator";
import { createUserValidationSchema } from "../utils/validationSchema.mjs";
import { users } from "../utils/constants.mjs";
import { resolveIndexById } from "../utils/middlewares.mjs";
import {
  User,
  Student,
  Teacher,
  Center,
  Calendar,
  Address,
} from "../models/index.js";

const router = Router();

// 1. GET Users
router.get(
  "/api/users",
  checkSchema(createUserValidationSchema(3, 10)),
  (req, res) => {
    const result = validationResult(req);
    const { filter, value } = req.query;

    if (filter && value) {
      const filteredUsers = users.filter(
        (user) => user[filter] && user[filter].includes(value)
      );
      return res.send(filteredUsers);
    } else {
      res.send(users);
    }
  }
);

// 2. GET User by ID
router.get("/api/users/:id", resolveIndexById, (req, res) => {
  const parsedId = parseInt(req.params.id);
  const findUser = users.find((user) => user.id === parsedId);

  if (!findUser) return res.sendStatus(404);
  return res.send(findUser);
});

// 3. POST (Create User)
router.post(
  "/api/users",
  checkSchema(createUserValidationSchema),
  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(404).end({ errors: result.array() });

    const data = matchedData(req);
    const newUser = { id: users[users.length - 1].id + 1, ...data };
    users.push(newUser);
    return res.status(200).send(newUser);
  }
);

// 4. PUT (Update User)
router.put("/api/users/:id", resolveIndexById, (req, res) => {
  const { body, userIndex } = req;
  users[userIndex] = { id: users[userIndex].id, ...body };
  return res.sendStatus(200);
});

// 5. PATCH (Update Some Fields)
router.patch("/api/users/:id", resolveIndexById, (req, res) => {
  const { body, userIndex } = req;
  users[userIndex] = { ...users[userIndex], ...body };
  return res.status(200).send(users[userIndex]);
});

// 6. DELETE (Remove User)
router.delete("/api/users/:id", resolveIndexById, (req, res) => {
  const { userIndex } = req;
  users.splice(userIndex, 1);
  return res.status(200).send(users);
});

// const createRole = async (role, userId, userData = {}) => {
//   const actions = {
//     student: () => ({
//       model: Student,
//       data: { user: userId },
//     }),
//     teacher: async () => {
//       const teacher = await Teacher.create({ user: userId });
//       const student = await Student.create({ user: userId });
//       return [
//         { model: Teacher, instance: teacher },
//         { model: Student, instance: student },
//       ];
//     },
//     center: async () => {
//       const address = await Address.findOrCreate(userData.address);
//       return {
//         model: Center,
//         data: { user: userId, address: address._id },
//       };
//     },
//   };

//   // Ejecutar la acción correspondiente al rol
//   if (actions[role]) {
//     return await actions[role]();
//   } else {
//     throw new Error(`Rol no válido: ${role}`);
//   }
// };

// 7. REGISTER User
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

      // Array para guardar los roles y sus IDs
      const roles = [];

      // Crear roles según el tipo
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

      // Crear el calendario según los roles establecidos
      for (const roleType of roles) {
        await Calendar.create({ roleType: roleType, user: newUser._id });
      }

      req.session.userId = newUser._id;
      req.session.role = newUser.role;
      req.session.initialRole = newUser.role;

      res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// 8. LOGIN User
router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.initialRole = user.role;
    req.session.visited = true;

    res.status(200).json({ msg: "Ok Login!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/api/login", (req, res) => {
  console.log(req.session);
  if (req.session.userId) {
    res.send({
      userId: req.session.userId,
      role: req.session.role,
      initialRole: req.session.initialRole,
    });
  } else {
    res.send({ msg: "No hay sesión iniciada" });
  }
});

router.post("/api/switch-role", (req, res) => {
  const { role } = req.body;

  req.session.role = role;

  // console.log("ROL EN SWITCH-ROLE:");
  // console.log(req.session.role);
  // console.log(req.session.initialRole);

  res.send({ role: role });
});

export default router;
