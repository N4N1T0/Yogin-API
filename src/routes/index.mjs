import { Router } from "express";
import users from "../routes/users.mjs";
import products from "../routes/products.mjs";
import auth from "../routes/auth.mjs";
import cart from "../routes/cart.mjs";
import events from "../routes/events.mjs";
import calendars from "../routes/calendars.mjs";
import teachers from "../routes/teachers.mjs";
import centers from "../routes/centers.mjs";

const router = Router();

router.use(users);
router.use(teachers);
router.use(centers);
router.use(calendars);
router.use(events);

//router.use(products);
//router.use(auth);
//router.use(cart);

export default router;
