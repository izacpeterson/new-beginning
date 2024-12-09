import express from "express";
import logger from "../utils/logger.js";
import Zoho from "../integrations/Zoho.js";
import HubSpot from "../integrations/HubSpot.js";

const router = express.Router();

// Helper function to map Zoho location data to HubSpot format
function mapZohoToHubSpotLocation(location) {
  return {
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
}

function mapHubSpotToZohoLocation(hubspotLocation) {
  return {
    id: hubspotLocation.zoho_location_id?.value,
    Name: hubspotLocation.location_name?.value,
    ALN_ID: hubspotLocation.aln_property_id?.value,
    Location_City: hubspotLocation.city?.value,
    Location_Country: hubspotLocation.country?.value,
    // Go_Live_Date: hubspotLocation.go_live_date?.value,
    Integration_Date: hubspotLocation.integration_date?.value,
    Location_Type: hubspotLocation.location_sector?.value,
    Location_Status: hubspotLocation.location_status?.value,
    Location_State: hubspotLocation.state_region?.value,
    // Buildout_Date: hubspotLocation.buildout_date?.value,
    // Monitoring_Complete_Date: hubspotLocation.monitoring_complete_date?.value,
    Location_Phone: hubspotLocation.phone?.value,
    Location_Code: hubspotLocation.postal_code?.value,
    Property_Units: hubspotLocation.property_units?.value,
    // QA_Date: hubspotLocation.qa_date?.value,
    // Training_Date: hubspotLocation.training_date?.value,
    // Acquisition_Date: hubspotLocation.acquisition_date?.value,
  };
}

// Helper function to associate a location with a company in HubSpot
async function associateLocationWithCompany(hs, locationId, companyId) {
  try {
    await hs.associateObjects("locations", locationId, "companies", companyId, "USER_DEFINED", "17");
    logger.info(`Successfully associated location ${locationId} with company ${companyId}`);
  } catch (error) {
    logger.error(`Error associating location ${locationId} with company ${companyId}: ${error.message}`);
    throw error;
  }
}

// Handle new Zoho location
router.post("/zohotohubspot/location", async (req, res) => {
  const { location, account } = req.body;

  const hs = new HubSpot();
  const zoho = new Zoho();
  logger.info("Processing location from Zoho", { locationId: location.id });

  const hsLoc = mapZohoToHubSpotLocation(location);

  try {
    await zoho.init();

    let result;

    if (location.HubSpot_Location_Id) {
      // Update existing location
      logger.info("Updating existing location in HubSpot", {
        hubSpotLocationId: location.HubSpot_Location_Id,
      });
      result = await hs.updateRecord("locations", `${location.id}`, hsLoc, "zoho_location_id");
      logger.info("Successfully updated location in HubSpot", { result });
    } else {
      // Create new location
      logger.info("Creating new location in HubSpot");
      result = await hs.createRecord("locations", hsLoc);
      logger.info("Successfully created new location in HubSpot", { result });
    }

    // Associate location with company
    await associateLocationWithCompany(hs, result.id || location.HubSpot_Location_Id, account.HubSpot_Company_Id);

    await zoho.updateRecord("Locations", location.id, {
      HubSpot_Location_Id: result.id || location.HubSpot_Location_Id,
    });

    res.send({ message: "Location processed successfully", result });
  } catch (error) {
    logger.error("Error processing location", { error: error.message });
    res.status(500).send({ error: "An error occurred while processing the location" });
  }
});

router.post("/hubspottozoho/location", async (req, res) => {
  const zoho = new Zoho();
  try {
    await zoho.init();

    const { properties: location } = req.body;

    // const updateData = {
    //   Name: location.location_name.value,
    // };

    const updateData = mapHubSpotToZohoLocation(location);

    const result = await zoho.updateRecord("Locations", location.zoho_location_id.value, updateData);

    logger.info("Successfully updated location in Zoho", { result });

    res.send({ message: "Location updated successfully", result });
  } catch (error) {
    logger.error("Error updating location in Zoho", { error: error.message });
    res.status(500).send({ error: "An error occurred while updating the location in Zoho" });
  }
});

export default router;
