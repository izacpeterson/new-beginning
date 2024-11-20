const logger = require("../utils/logger.js");
const { alnApiKey } = require("../config.js");

class ALN {
  constructor() {
    this.baseUrl = "https://odata4.alndata.com/";
    this.apiKey = alnApiKey;
  }

  async getCompany(id) {
    const url = `${this.baseUrl}ManagementCompanies?apikey=${this.apiKey}&$filter=MgmtOfficeIntegerId%20eq%20${id}&$expand=Addresses`;

    try {
      // Make the API request
      const response = await fetch(url);

      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      // Parse the JSON response
      const data = await response.json();

      // Validate the response structure
      if (data && Array.isArray(data.value) && data.value.length > 0) {
        return data.value[0]; // Return the first company object
      } else {
        throw new Error("Company not found or the API returned an unexpected structure.");
      }
    } catch (error) {
      // Log the error for debugging purposes
      logger.error(`Error in getCompany: ${error.message}`);

      // Throw the error to be handled by the caller
      // throw new Error(`Failed to fetch company data: ${error.message}`);
    }
  }

  // async getProperty(id) {}
}

module.exports = ALN;
