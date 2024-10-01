import express from "express";
import mongoDBCon from "./db/mongo_db.mjs";

// psw: 8Iqj5kROkkCdSZlM
//stephanie_castro
//Middleware

import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";

// Configure dotenv to load environment variables
dotenv.config();

// Variables
const app = express();

// Configuración de CORS
const corsOptions = {
  origin: "http://localhost:5173", // URL del frontend
  credentials: true, // Habilitar el envío de cookies con las solicitudes
};

app.use(cors(corsOptions));

// Middlewares para parsear las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CookieParser con firma
app.use(cookieParser("secret"));
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para gestionar las sesiones
app.use(
  session({
    key: "session_data",
    secret: "psw123", // Asegúrate de usar un secreto fuerte y único
    saveUninitialized: false, // No guardar sesiones vacías
    resave: false, // No volver a guardar la sesión si no se modifica
    cookie: {
      maxAge: 60000 * 60, // 1 hora
      httpOnly: true, // Asegura que la cookie no sea accesible desde JavaScript
    },
  })
);

// Integrar Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de rutas
app.use(routes);

// Ejemplo de Middleware para logging
const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
};

// Middleware global para logging
app.use(loggingMiddleware);

// Conexión a la base de datos
console.log(mongoDBCon);

// Ruta para la página principal con manejo de sesión y cookies
app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.sessionID); // session.id

  // Evitar que se regenere una sesión en cada recarga
  req.session.visited = req.session.visited || true;

  // Configuración de cookies firmadas (si no está ya configurada en la cookie del cliente)
  if (!req.cookies.sessionData) {
    res.cookie(
      "sessionData",
      JSON.stringify({
        userId: req.session.userId,
        role: req.session.role,
      }),
      {
        maxAge: 60000, // 1 minuto
        httpOnly: true, // Asegura que la cookie no sea accesible desde JavaScript
        signed: true, // Firma la cookie
      }
    );
  }

  res.send({ userId: req.session.userId, role: req.session.role });
});

// Configuración del puerto y escucha de la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});
