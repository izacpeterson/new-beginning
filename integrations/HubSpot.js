/* eslint-disable class-methods-use-this */
const logger = require("../utils/logger.js");
const { hsApiKey } = require("../config.js");

class HubSpot {
  constructor() {
    this.baseUrl = "https://api.hubapi.com/crm/v3";
    this.token = hsApiKey;
  }

  async getRecord(module, id, properties) {
    const url = `${this.baseUrl}/objects/${module}/${id}?properties=${properties.join()}`;
    try {
      const response = await fetch(url, {
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      return data;
    } catch (error) {
      logger.error(`Unable to get hubspot record. ${module}:${id} - ${error} `);
    }
  }

  async updateRecord(module, id, updates) {
    const url = `${this.baseUrl}/objects/${module}/${id}`;
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: updates,
        }),
      });
      const data = await response.json();

      return data;
    } catch (error) {
      logger.error(`Unable to update hubspot record. ${module}:${id} - ${error} `);
    }
  }

  async createRecord(module, properties) {
    const url = `${this.baseUrl}/objects/${module}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: properties,
        }),
      });
      const data = await response.json();

      return data;
    } catch (error) {
      logger.error(`Unable to create hubspot record. ${module} - ${error} `);
    }
  }

  async getAllRecords(module, properties, dev = false) {
    const baseUrl = `${this.baseUrl}/objects/${module}?properties=${properties.join()}`;
    let results = [];
    let after = undefined;

    try {
      while (true) {
        let requestUrl = baseUrl;
        if (after !== undefined) {
          requestUrl += `&after=${after}`;
        }

        const response = await fetch(requestUrl, {
          headers: {
            authorization: `Bearer ${this.token}`,
          },
        });

        const data = await response.json();

        results = results.concat(data.results);

        // If in dev mode and we have 100 records, stop fetching
        if (dev && results.length >= 150) {
          results = results.slice(0, 150);
          break;
        }

        if (data.paging && data.paging.next && data.paging.next.after) {
          after = data.paging.next.after;
        } else {
          break;
        }
      }

      return results;
    } catch (error) {
      logger.error(`Unable to get all hubspot records. ${module} - ${error}`);
    }
  }

  async getModuleProperties(module) {
    const url = `${this.baseUrl}/properties/${module}`;

    try {
      const response = await fetch(url, {
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      let propertyArray = [];

      data.results.forEach((property) => {
        propertyArray.push(property.name);
      });

      return propertyArray;
    } catch (error) {
      logger.error(`Unable to get hubspot properties. ${module} - ${error} `);
    }
  }

  async getModulePropertiesDetais(module) {
    const url = `${this.baseUrl}/properties/${module}`;

    try {
      const response = await fetch(url, {
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      let propertyArray = [];

      data.results.forEach((property) => {
        propertyArray.push(property);
      });

      return propertyArray;
    } catch (error) {
      logger.error(`Unable to get hubspot properties. ${module} - ${error} `);
    }
  }

  async bulkUpdateRecords(module, updates) {
    const url = `${this.baseUrl}/objects/${module}/batch/update`;

    // Split the updates into batches of 100
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      batches.push(updates.slice(i, i + batchSize));
    }

    const results = [];

    for (const batch of batches) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: batch.map((update) => ({
              id: update.id,
              properties: update.properties,
            })),
          }),
        });

        const data = await response.json();
        results.push(data);
      } catch (error) {
        logger.error(`Unable to bulk update hubspot record. ${module}:${id} - ${error} `);
      }
    }

    return results;
  }

  async batchCreateRecords(objectType, records) {
    const url = `${this.baseUrl}/objects/${objectType}/batch/create`;
    const batchSize = 100; // HubSpot's maximum batch size
    const batches = [];

    // Split records into batches of 100
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    const results = [];

    for (const [index, batch] of batches.entries()) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: batch.map((record) => ({
              properties: record,
            })),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Batch ${index + 1} create failed: ${JSON.stringify(data)}`);
        }

        results.push(data);
      } catch (error) {
        logger.error(`Unable to batch create records in ${objectType} (Batch ${index + 1}): ${error.message}`);
        // Optionally, you can decide whether to continue with other batches or halt execution
        // For example, to halt on first error, you can re-throw the error:
        // throw error;
      }
    }

    return results;
  }

  async searchRecords(objectType, searchRequest) {
    const url = `${this.baseUrl}/objects/${objectType}/search`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error(`Search API request failed. Status: ${response.status} - ${JSON.stringify(errorData)}`);
        throw new Error(`Search API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error(`Unable to search HubSpot records. ObjectType: ${objectType} - Error: ${error.message}`);
      throw error; // Re-throw the error after logging
    }
  }
}

module.exports = HubSpot;
