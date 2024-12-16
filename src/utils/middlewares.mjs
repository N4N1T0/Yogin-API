//MIDDLEWARE
import { User } from "../models/index.js";

// Puedes usar el función authenticate de passport para extra seguridad
export const resolveUserById = async (req, res, next) => {
  const {
    params: { id },
  } = req;

  const parsedId = parseInt(id);

  // Si no es un número
  if (isNaN(parsedId)) return res.sendStatus(400);

  // Si no existe el usuario en
  const user = await User.findById(parsedId);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  // NOTA: como NO se puede pasar datos de un MIDDLEWARE a otro se modifica los valores de REQUEST y RESPONSE
  req.userId = id;
  next(); // Se pueden pasar parámetros de tipo NULL o ERROR
};

// ---> INNECESARIO - Lo puedes usar con la función authenticate de passport para las rutas protegidas
// // Middleware para proteger rutas
// export const authMiddleware = (req, res, next) => {
//   if (req.session.userId) {
//     next();
//   } else {
//     res.status(401).json({ message: "No autorizado" });
//   }
// };
