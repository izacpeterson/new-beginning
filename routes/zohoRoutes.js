const express = require("express");
const router = express.Router();

const logger = require("../utils/logger.js");

const Zoho = require("../integrations/Zoho.js");
const HubSpot = require("../integrations/HubSpot.js");

router.post("/location/new", async (req, res) => {
  const hs = new HubSpot();

  logger.info("Received request to create a new location");

  try {
    const location = req.body.location;

    let result = await hs.createRecord("locations", {
      zoho_location_id: location.id,
      location_name: location.Name,
      aln_property_id: location.ALN_ID,
    });

    logger.info("Successfully created new location in HubSpot", {
      hubspot_location_id: result.id,
    });

    res.send({ msg: "new", id: result.id, result: result });
  } catch (error) {
    logger.error("Error while creating new location in HubSpot", { error: error.message });
    res.status(500).send({ error: "Failed to create location" });
  }
});

router.post("/location/update", async (req, res) => {
  const hs = new HubSpot();

  logger.info("Received request to update location");

  try {
    const location = req.body.location;

    let result = await hs.updateRecord("locations", parseInt(location.HubSpot_Location_ID), {
      location_name: location.Name,
    });

    logger.info("Successfully updated location in HubSpot", {
      hubspot_location_id: location.HubSpot_Location_ID,
    });

    res.send({ msg: "Zoho Location update processed", result: result });
  } catch (error) {
    logger.error("Error while updating location in HubSpot", { error: error.message });
    res.status(500).send({ error: "Failed to update location" });
  }
});

module.exports = router;
