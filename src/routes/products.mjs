import { Router } from "express";

const router = Router();

router.get("/api/products", (req, res) => {
  //Ejemplo de cómo se muestran las cookies
  //Desde el header sin parsear
  console.log(req.headers.cookie);

  //Utilizando el middleware de CookieParser
  console.log(req.cookies);

  //Cuando la cookie esté SIGNED/FIRMADA
  console.log(req.signedCookies.cookie1);

  //Ejemplo de uso de cookie
  if (req.cookies.cookie1 && req.cookies.cookie1 === "test1")
    // if (req.signedCookies.cookie1 && req.signedCookies.cookie1 === "test1")
    return res.send([{ id: 123, name: "chicken", price: 12.99 }]);
  return res.send({ msg: "Sorry, you need cookies!" });
});

export default router;
