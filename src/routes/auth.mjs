import { Router } from "express";
import { users } from "../utils/constants.mjs";
import passport from "passport";
import "../strategies/local-strategy.mjs";

const router = Router();

// router.post("/api/auth", (req, res) => {
//   const {
//     body: { username, password },
//   } = req;

//   const findUser = users.find((user) => user.username === username);

//   if (!findUser || findUser.password !== password)
//     return res.status(401).send({ msg: "BAD CREDENTIALS" });

//   req.session.user = findUser;

//   res.status(200).send(findUser);
// });

router.get("/api/auth/status", (req, res) => {
  console.log("REQUEST SESSION USER:");
  console.log(req.session.user);

  console.log("REQUEST USER:");
  console.log(req.user);

  console.log("REQUEST SESSION:");
  console.log(req.session);

  return req.session.user
    ? res.status(200).send(req.session.user)
    : res.status(401).send({ msg: "Not Authenticated" });
});

router.post("/api/auth", passport.authenticate("local"), (req, res) => {
  res.sendStatus(200);
});

router.post("/api/auth/logout", (req, res) => {
  if (!req.user) return res.sendStatus(401);

  req.logOut((err) => {
    if (err) return res.sendStatus(400);
    res.sendStatus(200);
  });
});

export default router;
