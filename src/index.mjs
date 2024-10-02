import express from "express";
import mongoDBCon from "./db/mongo_db.mjs";
import MongoStore from "connect-mongo";

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
const allowedOrigins = [
  "https://yogin-website.vercel.app",
  "https://yogin-api.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite las solicitudes de orígenes presentes en el array
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Habilita el uso de cookies
  methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
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
    secret: process.env.SESSION_SECRET, // Clave secreta para firmar las cookies
    resave: false, // No volver a guardar la sesión si no ha sido modificada
    saveUninitialized: false, // No guardar sesiones vacías
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // Conexión a tu base de datos MongoDB
      ttl: 14 * 24 * 60 * 60, // Tiempo de vida de las sesiones (14 días en este caso)
    }),
    cookie: {
      maxAge: 60000 * 60, // Tiempo de vida de la cookie en milisegundos (1 hora aquí)
      httpOnly: true, // Las cookies no son accesibles a JavaScript del cliente
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
