const express = require("express");
const router = express.Router();

const logger = require("../utils/logger.js");

const Zoho = require("../integrations/Zoho.js");
const HubSpot = require("../integrations/HubSpot.js");

//handle new zoho location
router.post("/zohotohubspot/location", async (req, res) => {
  const hs = new HubSpot();

  const location = req.body.location;
  const account = req.body.account;

  //   console.log(account);

  let hs_loc = {
    zoho_location_id: location.id,
    location_name: location.Name,
    aln_property_id: location.ALN_ID,
    city: location.Location_City,
    country: location.Location_Country,
    go_live_date: location.Go_Live_Date,
    integration_date: location.Integration_Date,
    location_sector: location.Location_Type,
    location_status: location.Location_Status,
    state_region: location.Location_State,
    buildout_date: location.Buildout_Date,
    monitoring_complete_date: location.Monitoring_Complete_Date,
    phone: location.Location_Phone,
    postal_code: location.Location_Code,
    property_units: location.Property_Units,
    qa_date: location.QA_Date,
    training_date: location.Training_Date,
    acquisition_date: location.Acquisition_Date,
  };

  if (location.HubSpot_Location_ID !== null && location.HubSpot_Location_ID !== "") {
    logger.info("Received request to update a location");

    try {
      let result = await hs.updateRecord("locations", parseInt(location.HubSpot_Location_ID), hs_loc);
      console.log(result);

      logger.info("Successfully updated location in HubSpot");

      res.send({ msg: "Zoho Location update processed", result: result });
    } catch (error) {}
  } else {
    logger.info("Received request to create a new location");

    try {
      let result = await hs.createRecord("locations", hs_loc);
      console.log(result);

      logger.info("Successfully created new location in HubSpot");

      res.send({ msg: "new", id: result.id, result: result });
    } catch (error) {
      logger.warn("Error in creating new location in HubSpot");
    }
  }
});

module.exports = router;
