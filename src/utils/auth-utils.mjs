import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const generateJWT = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    initialRole: user.role,
  }; // Puedes agregar más datos al payload
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "72h" }); // Ajusta el tiempo de expiración según necesites
  return token;
};

// Función para obtener el usuario desde el payload del JWT
export const getUserFromJwt = async (jwt_payload) => {
  try {
    // Obtener el usuario desde la base de datos usando el ID del payload
    const user = await User.findById(jwt_payload.userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user; // Retorna el usuario encontrado
  } catch (error) {
    throw new Error("Error al verificar el token JWT", error);
  }
};
