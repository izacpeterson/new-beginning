import logger from "../utils/logger.js";
import { alnApiKey } from "../config.js";

export default class ALN {
  constructor() {
    this.baseUrl = "https://odata4.alndata.com/";
    this.apiKey = alnApiKey;
  }

  async getCompany(id, retries = 3) {
    const url = `${this.baseUrl}ManagementCompanies?apikey=${this.apiKey}&$filter=MgmtOfficeIntegerId%20eq%20${id}&$expand=Addresses`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Make the API request
        const response = await fetch(url);

        // Check for HTTP errors
        if (!response.ok) {
          if (response.status === 429) {
            // Handle rate limiting
            const retryAfter = response.headers.get("Retry-After");
            const delayTime = retryAfter
              ? Math.max(parseInt(retryAfter, 10) * 1000, 100) // Ensure at least 100ms delay
              : 100; // Minimal fallback delay for rate limit
            logger.warn(`Rate limited. Retrying after ${delayTime} ms (Attempt ${attempt + 1})`);
            await this.delay(delayTime);
            continue; // Retry the request
          }

          // Handle other HTTP errors
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
        logger.error(`Error in getCompany (Attempt ${attempt + 1}): ${error.message}`);

        if (attempt === retries) {
          // Throw the error after exhausting retries
          throw new Error(`Failed to fetch company data after ${retries + 1} attempts: ${error.message}`);
        }

        // Delay before the next retry with minimal backoff
        const backoff = 100; // Fixed 100ms backoff
        await this.delay(backoff);
      }
    }
  }

  async getLocations(alnId, retries = 3) {
    const url = `${this.baseUrl}Apartments?apikey=${this.apiKey}&$filter=Property/ALNId%20eq%20${alnId}&$expand=Addresses`;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // await this.delay(300);
        // Make the API request
        const response = await fetch(url);

        // Check for HTTP errors
        if (!response.ok) {
          if (response.status === 429) {
            // Handle rate limiting
            const retryAfter = response.headers.get("Retry-After");
            const delayTime = retryAfter
              ? Math.max(parseInt(retryAfter, 10) * 1000, 100) // Ensure at least 100ms delay
              : 100; // Minimal fallback delay for rate limit
            logger.warn(`Rate limited. Retrying after ${delayTime} ms (Attempt ${attempt + 1})`);
            await this.delay(delayTime);
            continue; // Retry the request
          }

          // Handle other HTTP errors
          throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Validate the response structure
        if (data && Array.isArray(data.value) && data.value.length > 0) {
          return data.value[0]; // Return all locations
        } else {
          throw new Error("Locations not found or the API returned an unexpected structure.");
        }
      } catch (error) {
        logger.error(`Error in getLocations (Attempt ${attempt + 1}): ${error.message}`);

        if (attempt === retries) {
          // Throw the error after exhausting retries
          throw new Error(`Failed to fetch locations after ${retries + 1} attempts: ${error.message}`);
        }

        // Delay before the next retry with minimal backoff
        const backoff = 100; // Fixed 100ms backoff
        await this.delay(backoff);
      }
    }
  }

  // Helper method for delay
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
