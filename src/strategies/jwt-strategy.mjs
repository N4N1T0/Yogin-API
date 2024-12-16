// passport-config.js
import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { getUserFromJwt } from "../utils/auth-utils.mjs";

// Configura la estrategia de JWT
const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      if (req && req.cookies) {
        return req.cookies.sessionToken;
      }
    },
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new Strategy(opts, (jwt_payload, done) => {
    // Busca al usuario usando el payload (puedes consultar la base de datos aquí)
    const user = getUserFromJwt(jwt_payload); // Implementa esta función para buscar al usuario
    if (user) {
      return done(null, user); // Si el usuario existe
    } else {
      return done(null, false); // Si no se encuentra al usuario
    }
  })
);

export default passport;
