const BaseCronJob = require("./BaseCronJob");
const logger = require("../utils/logger");
const HubSpot = require("../integrations/HubSpot.js");
const ALN = require("../integrations/ALN.js");

const hs = new HubSpot();
const aln = new ALN();

class HubSpotCron extends BaseCronJob {
  constructor() {
    super("HubSpotAlnCron");
    this.cronTime = "0 9-17 * * 1-5"; // Define the cron time inside the class
  }

  async execute() {
    logger.info(`${this.name} execution started.`);

    try {
      // Your specific job logic here
      //   let result = await hs.updateRecord('locations', '19753354062', { aln_sync_time: new Date() });

      let records = await hs.getAllRecords("companies", ["aln_management_id"]);
      const recordsToUpdate = [];
      //   logger.info(JSON.stringify(records));
      for (const record of records) {
        const alnInfo = await aln.getCompany(record.properties.aln_management_id);

        console.log(record.id);

        if (!alnInfo) continue;

        const address = alnInfo.Addresses?.[0];
        if (!address) continue;

        let potentialRevenue = (alnInfo.OfficeUnitCount || 0) * 0.7;
        console.log(potentialRevenue);

        recordsToUpdate.push({
          id: record.id,
          properties: {
            aln_street: address.AddressLine1 || "",
            // aln_street_2: address.AddressLine2 || '',
            aln_city: address.AddressCity || "",
            aln_state: address.AddressState || "",
            aln_zip_code: address.AddressZIP || "",
            aln_management_name: alnInfo.ManagementCompanyName || "",
            aln_property_cnt: alnInfo.OfficePropertyCount || 0,
            aln_unit_cnt: alnInfo.OfficeUnitCount || 0,
            aln_website: alnInfo.ManagementCompanyWebSite || "",
          },
        });
      }

      let result = await hs.bulkUpdateRecords("companies", recordsToUpdate);

      logger.info(`${this.name} execution completed.`);
    } catch (error) {
      logger.error(`${this.name} error: ${error.message}`);
    }
  }
}

module.exports = HubSpotCron;
