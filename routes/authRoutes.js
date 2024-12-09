import express from "express";
import path from "path";
import session from "express-session";

const router = express.Router();

router.post("/login", (req, res) => {
  req.session.loggedIn = true;
  console.log("USER LOG IN");
  res.send({ success: true });
});

export default router;
