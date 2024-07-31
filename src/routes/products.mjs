import { Router } from "express";
import Product from "../models/product.model.js";

const router = Router();

router.get("/api/products", async (req, res) => {
  //Ejemplo de cómo se muestran las cookies
  //Desde el header sin parsear
  // console.log(req.headers.cookie);

  // //Utilizando el middleware de CookieParser
  // console.log(req.cookies);

  // //Cuando la cookie esté SIGNED/FIRMADA
  // console.log(req.signedCookies.cookie1);

  // //Ejemplo de uso de cookie
  // if (req.cookies.cookie1 && req.cookies.cookie1 === "test1")
  //   // if (req.signedCookies.cookie1 && req.signedCookies.cookie1 === "test1")
  //   return res.send([{ id: 123, name: "chicken", price: 12.99 }]);
  // return res.send({ msg: "Sorry, you need cookies!" });
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(200).json({ msg: error.message });
  }
});

router.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(200).json({ msg: error.message });
  }
});

router.post("/api/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, req.body);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const updatedProduct = await Product.findById(id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(400).json({ msg: "Product not found!" });
    }

    res.status(200).json({ msg: "Product deleted successfuly" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

export default router;
