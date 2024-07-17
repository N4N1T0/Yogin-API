// Dependencias
import express from "express";

//Middleware
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

// Variables
const app = express();

//Middleware para las peticiones
// ! IMP: los MIDDLEWARE deben crearse antes de la gestión de las peticiones
app.use(express.json());

// ! IMP: el uso de CookieParser debe ser anterior a las rutas de los MIDDLEWARE de users y products
//app.use(cookieParser()); ! CUANDO NO ESTA "Firmada" no se le pasan parámetros

//CUANDO ESTÁ "Firmada" SE LE INTRODUCE TEXTO para parsearla
// Middleware para configurar manualmente los headers de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // Permitir el origen de React
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(cookieParser("secret"));

//Middleware para gestionar las SESSIONS
app.use(
  session({
    secret: "psw123",
    saveUninitialized: false, // Se deja en false cuando las propiedades de la SESSION no cambian. Ej: usuarios que solo ven tu página
    resave: false,
    cookie: {
      maxAge: 60000 * 60,
    },
  })
);

// IMP! Si queremos usar PASSPORT tiene que ser después de la SESSION y antes de las ROUTES
app.use(passport.session());

app.use(routes);

//Ejemplo de MIDDLEWARE simple
const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method} - ${res.url}`);

  next();
};

//Esto permite usar este MIDDLEWARE de forma GLOBAL por todas las petiones
app.use(loggingMiddleware);

const PORT = process.env.PORT || 3000;

// 1. Permite escuchar las peticiones https según el puerto escogido
// 1.1 Parámetros: PUERTO, lógica interna
app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});

// 2. Función encargada de responder por el método GET a través de la URL deseada. (CALLBACK)
// 2.1 Parámetros: URL(string), petición, respuesta
app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.sessionID); // session.id

  //Con esto evitamos que se genere una clave para la SESSION cada vez que se recargue la página
  req.session.visited = true;

  //res.cookie("cookie1", "test1", { maxAge: 60000 });
  res.cookie("cookie1", "test1", { maxAge: 60000, signed: true });
  res.send({ msg: "hello" });
});
