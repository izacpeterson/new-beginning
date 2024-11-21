const express = require("express");
const router = express.Router();

const Zoho = require("../integrations/Zoho.js");

router.post("/location/sync", async (req, res) => {
  const zoho = new Zoho(process.env.ZOHO_CLIENT_ID, process.env.ZOHO_CLIENT_SECRET);
  zoho.init();

  const zohoId = req.body.location.id;
  console.log(zohoId);
  const location = await zoho.getRecord("locations", zohoId);

  console.log(location);

  res.send({ msg: "Zoho Location update processed" });
});

module.exports = router;
