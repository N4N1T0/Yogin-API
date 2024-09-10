import { Router } from "express";
import { validationResult, checkSchema, matchedData } from "express-validator";
import { createUserValidationSchema } from "../utils/validationSchema.mjs";
import { users } from "../utils/constants.mjs";
import { resolveIndexById } from "../utils/middlewares.mjs";
import { User, Student, Teacher, Center } from "../models/index.js";

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

// 7. REGISTER User
router.post(
  "/api/register",
  checkSchema(createUserValidationSchema),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const dbUser = await User.findOne({ email });

      if (dbUser) {
        return res.status(401).send({ message: "ERROR. Usuario preexistente" });
      }

      const newUser = new User({ name, email, password, role });
      await newUser.save();

      if (role === "student") {
        await Student.create({ user: newUser._id });
      } else if (role === "teacher") {
        await Teacher.create({ user: newUser._id });
      } else if (role === "center") {
        await Center.create({ user: newUser._id });
      }

      req.session.userId = newUser._id;
      req.session.role = newUser.role;

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
    req.session.visited = true;

    res.status(200).json({ msg: "Ok Login!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/api/login", (req, res) => {
  console.log(req.session);
  if (req.session.userId) {
    res.send({ userId: req.session.userId, role: req.session.role });
  } else {
    res.send({ msg: "No hay sesión iniciada" });
  }
});

export default router;
