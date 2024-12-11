import express from "express";
import { getErrorsFromDB } from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  let errors = await getErrorsFromDB();

  res.send(errors);
});

export default router;
