import BaseCronJob from "./BaseCronJob.js";
import logger from "../utils/logger.js";
import HubSpot from "../integrations/HubSpot.js";
import ALN from "../integrations/ALN.js";

const hs = new HubSpot();
const aln = new ALN();

export default class HubSpotCron extends BaseCronJob {
  constructor() {
    super("HubSpotAlnCron");
    this.cronTime = "0 9-17 * * 1-5";
  }

  async execute() {
    logger.info(`${this.name} execution started.`);

    try {
      let records = await hs.getAllRecords("companies", ["aln_management_id"]);
      const recordsToUpdate = [];

      for (const record of records) {
        if (!record.properties.aln_management_id) continue;

        try {
          const alnInfo = await aln.getCompany(record.properties.aln_management_id);

          if (!alnInfo) {
            logger.warn(`No data found for company ID: ${record.properties.aln_management_id}`);
            continue;
          }

          const address = alnInfo.Addresses?.[0];
          if (!address) {
            logger.warn(`No address found for company ID: ${record.properties.aln_management_id}`);
            continue;
          }

          let potentialRevenue = (alnInfo.OfficeUnitCount || 0) * 0.7;
          console.log(`Potential Revenue for ${record.id}: ${potentialRevenue}`);

          recordsToUpdate.push({
            id: record.id,
            properties: {
              aln_street: address.AddressLine1 || "",
              aln_city: address.AddressCity || "",
              aln_state: address.AddressState || "",
              aln_zip_code: address.AddressZIP || "",
              aln_management_name: alnInfo.ManagementCompanyName || "",
              aln_property_cnt: alnInfo.OfficePropertyCount || 0,
              aln_unit_cnt: alnInfo.OfficeUnitCount || 0,
              aln_website: alnInfo.ManagementCompanyWebSite || "",
            },
          });
        } catch (error) {
          logger.error(`Failed to process company ID: ${record.properties.aln_management_id} - ${error.message}`);
          // Continue to the next record even if one fails
          continue;
        }
      }

      if (recordsToUpdate.length > 0) {
        // const result = await hs.bulkUpdateRecords("companies", recordsToUpdate);
        logger.info(`Updated ${recordsToUpdate.length} records successfully.`);
      } else {
        logger.info(`No records to update.`);
      }

      logger.info(`${this.name} execution completed.`);
    } catch (error) {
      logger.error(`${this.name} error: ${error.message}`);
    }
  }
}
