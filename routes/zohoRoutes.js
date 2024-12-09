import express from "express";
import Zoho from "../integrations/Zoho.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.get("/records/:module/:id", async (req, res) => {
  try {
    const zoho = new Zoho();
    await zoho.init();

    // const module = req.params.module;
    const module = "Accounts";
    const id = req.params.id;
    //   const properties = [];
    const record = await zoho.getRecord(module, id);

    res.json(record);
  } catch (error) {
    res.send({ error: error });
  }
});

export default router;

//126,146
