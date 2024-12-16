import express from "express";
import mongoDBCon from "./db/mongo_db.mjs";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import passport from "./strategies/jwt-strategy.mjs";

// psw: 8Iqj5kROkkCdSZlM
//stephanie_castro
//Middleware

// Configure dotenv to load environment variables
dotenv.config();

// Variables
const app = express();

// ---> MEJOR USAR ENVIRONMENT VARIABLES
const corsOptions = {
  origin: [
    //LOCALHOST
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",

    //VERCEL
    "https://yogin-website.vercel.app",
    "https://yogin-api-2.vercel.app",
    "https://yogin-website-beta.vercel.app",
    "https://yogin-api-lilac.vercel.app",

    //RENDER
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
app.use(cookieParser()); // ---> No se necesita el secreto con los JWT
app.use(bodyParser.urlencoded({ extended: true }));
app.set("trust proxy", true); // trust first proxy

// Initialize passport
passport.initialize();

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
await mongoDBCon;

// Configuración del puerto y escucha de la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});

// ---> INNECESARIO
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
