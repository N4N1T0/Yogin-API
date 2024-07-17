import passport from "passport";
import { Strategy } from "passport-local";
import { users } from "../utils/constants.mjs";

// Esta función de Passport permite serializar el objeto del USUARIO dentro de la SESSION
// Se le pasa el usuario
// Se llama cuando hacemos login
passport.serializeUser((user, done) => {
  console.log(`Inside Serialize User`);
  console.log(user);

  //Se introduce en el PASPORT el user ID en la SESSION
  done(null, user.id);
});

// Esta función, através del ID, nos permite deserializar el Objeto del USUARIO presente en la SESSION para trabajar con él
// Se llama cuando se hace otra consulta de la ruta, pero ya contamos con la SESSION
passport.deserializeUser((id, done) => {
  // Podemos pasarle a PASSPORT ya sea ID y otros campos de nuestro usuario (username, age, email, etc)
  console.log(`Inside Deserializer`);
  console.log(`Deserializing User ID: ${id}`);

  try {
    const findUser = users.find((user) => user.id === id);

    if (!findUser) throw new Error("Users not Found!");

    done(null, findUser);
  } catch (err) {
    done(err, null);
  }
});

export default passport.use(
  new Strategy(
    /*Options*/ /*{ usernameField: "email" }, */
    (username, password, done) => {
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);

      try {
        const findUser = users.find((user) => user.username === username);

        if (!findUser) throw new Error("User not found");

        if (findUser.password !== password)
          throw new Error("Incorrect password");

        done(null, findUser);
        //
      } catch (err) {
        done(err, null);
      }
    }
  )
);
