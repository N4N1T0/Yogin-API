import { Router } from "express";
import { validationResult, checkSchema, matchedData } from "express-validator"; // Middleware
import { createUserValidationSchema } from "../utils/validationSchema.mjs";
import { users } from "../utils/constants.mjs";
import { resolveIndexById } from "../utils/middlewares.mjs";
import { User } from "../models/user.model.js";
//import jwt from "jsonwebtoken";

const router = Router();

router.get(
  "/api/users",

  //MIDDLEWARE SCHEMA
  /* 
    query("filter")
      .isString()
      .withMessage("It must be a string")
      .notEmpty()
      .withMessage("Username cannot be empty")
      .isLength({ min: 3, max: 10 })
      .withMessage("Between 3-10 characters"),
    */
  checkSchema(createUserValidationSchema(3, 10)),

  (req, res) => {
    console.log("SESSION INFO:");
    console.log(req.session);
    console.log(req.sessionID); // session.id

    //Ejemplo de USO de SESSION
    req.sessionStore.get(req.sessionID, (err, sessionData) => {
      if (err) {
        console.log(err);
        throw err;
      }

      console.log(sessionData);
    });

    //console.log(req["express-validator#contexts"]);

    // Obtenemos el resultado de la validación aplicada
    const result = validationResult(req);

    //console.log(result);

    // Extraemos filter y value del query
    const { filter, value } = req.query;

    // Cuando filter y value NO son 'undefined'
    if (filter && value) {
      // Filtramos los usuarios asegurándonos de que user[filter] no sea undefined
      const filteredUsers = users.filter((user) => {
        return user[filter] && user[filter].includes(value);
      });
      return res.send(filteredUsers);
    } else {
      // Si no hay filter y value, enviamos todos los usuarios
      res.send(users);
    }
  }
);

//3. Enviar parámetros por la URL para dar respuesta
router.get("/api/users/:id", resolveIndexById, (req, res) => {
  // // Al devolverse el objeto como un String, necesitamos convertirlo a un número
  const parsedId = parseInt(req.params.id);

  // // En una variable guardamos el usuario que coincide con el ID
  const findUser = users.find((user) => user.id === parsedId);

  // Si no se encuentra el ID del usuario
  if (!findUser) return res.sendStatus(404);

  // Si se encuentra el ID del usuario
  return res.send(findUser);
});

// 4. POST (añadir usuarios)
router.post(
  //ROUTE
  "/api/users",

  //MIDDLEWARE
  /* 
    body("username")
     .isString()
      .withMessage("It must be a string")
      .notEmpty()
      .withMessage("Username cannot be empty")
      .isLength({ min: 5, max: 32 })
      .withMessage("Between 5-12 characters"),
    */
  checkSchema(createUserValidationSchema),

  //PARAMS
  (req, res) => {
    console.log(req.body);

    //Resultado de las validaciones del MIDDLEWARE con BODY (USERNAME)
    const result = validationResult(req);
    console.log(`GET`);
    console.log(result);

    //Si NO está vació el Objeto de ERRORES
    if (!result.isEmpty())
      return res.status(404).end({ errors: result.array() });

    // Nos recoge los datos que han sido validados
    const data = matchedData(req);
    console.log(data);

    //const { body } = req;

    const newUser = { id: users[users.length - 1].id + 1, .../*body*/ data };

    users.push(newUser);

    return res.status(200).send(newUser);
  }
);

// 5. PUT (Update todos los campos de la BBDD)
router.put("/api/users/:id", resolveIndexById, (req, res) => {
  const { body, userIndex } = req;

  //Hacemos los cambios en el usuario
  users[userIndex] = { id: users[userIndex].id, ...body };

  //Enviamos la respuesta
  return res.sendStatus(200);
});

// 6. PATCH (Update uno o pocos campos de la BBDD)
router.patch("/api/users/:id", resolveIndexById, (req, res) => {
  const { body, userIndex } = req;

  //Hacemos los cambios en el usuario
  users[userIndex] = { ...users[userIndex], ...body };

  //Enviamos la respuesta
  return res.status(200).send(users[userIndex]);
});

// 7. DELETE
router.delete("/api/users/:id", resolveIndexById, (req, res) => {
  const { userIndex } = req;

  // Splice -> Eliminar 1 SOLO elemento teniendo en cuenta el index del elemento
  users.splice(userIndex, 1);

  // Devolvemos una respuesta
  return res.status(200).send(users);
});

/* ------------------------------------ REGISTER AND LOGIN ------------------------------------ */
// Registro de usuario
router.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login de usuario
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

    // Generar un token JWT
    // const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    //   expiresIn: "1h",
    // });
    res.status(200).json({ msg: "Ok Login!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
