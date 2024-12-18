import express from "express";
import { getLogsFronDB } from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  let logs = await getLogsFronDB();

  res.send(logs);
});

export default router;
