import express from "express";
import path from "path";
import session from "express-session";
import { generateNewApiKey } from "../utils/auth.js";

const router = express.Router();

router.post("/login", (req, res) => {
  req.session.loggedIn = true;
  console.log("USER LOG IN");
  res.send({ success: true });
});

router.get("/newApiKey", async (req, res) => {
  let key = await generateNewApiKey();

  res.send({ key });
});

export default router;
