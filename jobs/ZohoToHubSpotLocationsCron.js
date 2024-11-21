const fs = require("fs").promises; // Use promise-based fs methods
const HubSpot = require("../integrations/HubSpot.js");
const ALN = require("../integrations/ALN.js");
const Zoho = require("../integrations/Zoho.js");
const BaseCronJob = require("./BaseCronJob");
const logger = require("../utils/logger");

class ZohoLocToHSLoc extends BaseCronJob {
  constructor() {
    super("Sync Zoho Locations to HubSpot Locations");
    this.cronTime = "0 9-17 * * 1-5";
    this.hs = new HubSpot();
    this.aln = new ALN();
  }

  async execute() {
    logger.info(`${this.name} started.`);

    try {
      // Initialize Zoho
      const zoho = new Zoho(process.env.ZOHO_CLIENT_ID, process.env.ZOHO_CLIENT_SECRET);
      await zoho.init();
      logger.info("Zoho initialized successfully.");

      // Read old Zoho locations from file
      let zohoOldLocations = [];
      try {
        const data = await fs.readFile("zohoLocations.json", "utf-8");
        zohoOldLocations = JSON.parse(data);
        logger.info(`Loaded ${zohoOldLocations.length} old Zoho locations from zohoLocations.json.`);
      } catch (readError) {
        if (readError.code === "ENOENT") {
          logger.warn("zohoLocations.json not found. Proceeding with empty old locations.");
        } else {
          throw new Error(`Failed to read zohoLocations.json: ${readError.message}`);
        }
      }

      // Fetch current Zoho locations
      let zohoLocations = [];
      try {
        zohoLocations = await zoho.getAllModuleRecords("Locations", ["Name", "ALN_ID"]);
        await fs.writeFile("zohoLocations.json", JSON.stringify(zohoLocations, null, 2));
        logger.info(`Fetched and saved ${zohoLocations.length} Zoho locations.`);
      } catch (fetchError) {
        throw new Error(`Error fetching Zoho locations: ${fetchError.message}`);
      }

      // Identify locations to update by comparing old and new data
      const oldLocationsMap = new Map(zohoOldLocations.map((loc) => [loc.id, loc]));
      const locationsToUpdate = zohoLocations.filter((newLoc) => {
        const oldLoc = oldLocationsMap.get(newLoc.id);
        if (!oldLoc) return false; // New location, no need to update existing HubSpot record

        // Check for any differences in properties
        return Object.keys(newLoc).some((key) => newLoc[key] !== oldLoc[key]);
      });

      logger.info(`Identified ${locationsToUpdate.length} locations to update.`);

      if (locationsToUpdate.length === 0) {
        logger.info("No locations need to be updated. Exiting.");
        return;
      }

      // Prepare updates for bulk update
      const updatePromises = locationsToUpdate.map(async (loc) => {
        try {
          const results = await this.hs.searchRecords("locations", {
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: "zoho_location_id",
                    operator: "EQ",
                    value: `${loc.id}`,
                  },
                ],
              },
            ],
          });

          if (results.results && results.results.length > 0) {
            const hsRecord = results.results[0];
            const updateProperties = {
              location_name: loc.Name,
              aln_id: loc.ALN_ID,
              // Add other properties to update as needed
            };

            return {
              id: hsRecord.id,
              properties: updateProperties,
            };
          } else {
            logger.warn(`No HubSpot records found for Zoho location ID: ${loc.id}`);
            return null;
          }
        } catch (updateError) {
          logger.error(`Error preparing update for location ${loc.id}: ${updateError.message}`);
          return null;
        }
      });

      // Execute all search operations in parallel
      const updatesWithIds = await Promise.all(updatePromises);

      // Filter out any null results (failed searches or no records found)
      const validUpdates = updatesWithIds.filter((update) => update !== null);

      logger.info(`Preparing to bulk update ${validUpdates.length} HubSpot records.`);

      if (validUpdates.length === 0) {
        logger.warn("No valid updates found to perform bulk update.");
        return;
      }

      // Perform bulk update
      const bulkUpdateResults = await this.hs.bulkUpdateRecords("locations", validUpdates);

      // Handle bulk update response
      if (bulkUpdateResults && bulkUpdateResults.length > 0) {
        bulkUpdateResults.forEach((batchResult, index) => {
          if (batchResult.results) {
            batchResult.results.forEach((result) => {
              if (result.status === "error") {
                logger.error(`Batch ${index + 1}: Failed to update record ID ${result.id} - ${result.message}`);
              } else {
                logger.info(`Batch ${index + 1}: Successfully updated record ID ${result.id}.`);
              }
            });
          }

          if (batchResult.errors && batchResult.errors.length > 0) {
            batchResult.errors.forEach((error) => {
              logger.error(`Batch ${index + 1}: ${error.message}`);
            });
          }
        });

        logger.info(`Bulk update completed with ${validUpdates.length} records.`);
      } else {
        logger.warn("Bulk update did not return any results.");
      }

      logger.info(`${this.name} execution completed successfully.`);
    } catch (error) {
      logger.error(`${this.name} encountered an error: ${error.message}`, { stack: error.stack });
      // Depending on requirements, you might want to rethrow the error or handle it accordingly
    }
  }
}

module.exports = ZohoLocToHSLoc;
