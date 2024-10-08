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
import { cookiesConfig, setCookies } from "./utils/cookiesConfig.mjs";

// Configure dotenv to load environment variables
dotenv.config();

// Variables
const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
    "https://yogin-website.vercel.app",
    "https://yogin-api.vercel.app",
    "https://yogin-api.onrender.com",
    "https://yogin-website.onrender.com",
    "https://yog-in.es",
    "https://www.yog-in.es",
    "https://yog-in.com",
    "https://www.yog-in.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
};

// Por favor funciona, lo único que pido es que no se genere un error de CORS
app.options("*", cors(corsOptions)); // Para manejar las solicitudes preflight
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("trust proxy", 1); // trust first proxy

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60, // 1 hora
    }),
    cookie: cookiesConfig,
  })
);

// Integrar Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  setCookies(req, res); // Configura cookies en cada solicitud
  next();
});

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
// app.get("/", (req, res) => {
//   console.log(req.session);
//   console.log(req.sessionID); // session.id

//   // Evitar que se regenere una sesión en cada recarga
//   req.session.visited = req.session.visited || true;

//   // Configuración de cookies firmadas (si no está ya configurada en la cookie del cliente)
//   if (!req.cookies.sessionData) {
//     res.cookie(
//       "sessionData",
//       JSON.stringify({
//         userId: req.session.userId,
//         role: req.session.role,
//       }),
//       {
//         maxAge: 60000, // 1 minuto
//         httpOnly: true, // Asegura que la cookie no sea accesible desde JavaScript
//         signed: true, // Firma la cookie
//       }
//     );
//   }

//   res.send({ userId: req.session.userId, role: req.session.role });
// });

// Configuración del puerto y escucha de la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});
