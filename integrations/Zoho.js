import sqlite3 from "sqlite3";
import "dotenv/config";
import logger from "../utils/logger.js";
sqlite3.verbose(); // Ensures verbose mode for sqlite3

export default class Zoho {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.token = null;

    // Initialize the database
    this.db = new sqlite3.Database("db.db", (err) => {
      if (err) {
        logger.error("Zoho Error: Could not connect to database", err);
      } else {
        this.initializeDatabase();
      }
    });
  }

  initializeDatabase() {
    // Create the tokens table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY,
        access_token TEXT,
        refresh_token TEXT,
        expires_in INTEGER,
        expires_at TEXT
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        logger.error("Zoho Error: Error creating tokens table", err);
      }
    });
  }

  async init() {
    await this.loadTokensFromDatabase();
    if (!this.token || this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
  }

  loadTokensFromDatabase() {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT * FROM tokens WHERE id = 1";
      this.db.get(selectQuery, (err, row) => {
        if (err) {
          logger.error("Zoho Error: Error loading token from database:", err);
          resolve();
        } else {
          if (row) {
            this.token = {
              access_token: row.access_token,
              refresh_token: row.refresh_token,
              expires_in: row.expires_in,
              expires_at: new Date(row.expires_at),
            };
          }
          resolve();
        }
      });
    });
  }

  saveTokensToDatabase() {
    return new Promise((resolve, reject) => {
      const upsertQuery = `
        INSERT INTO tokens (id, access_token, refresh_token, expires_in, expires_at)
        VALUES (1, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          access_token = excluded.access_token,
          refresh_token = excluded.refresh_token,
          expires_in = excluded.expires_in,
          expires_at = excluded.expires_at
      `;

      this.db.run(upsertQuery, [this.token.access_token, this.token.refresh_token, this.token.expires_in, this.token.expires_at.toISOString()], function (err) {
        if (err) {
          logger.error("Zoho Error: Error saving token to database:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  isTokenExpired() {
    const expirationTime = new Date(this.token.expires_at);
    return new Date() >= expirationTime;
  }

  async getAccessTokenFromCode(code) {
    const url = "https://accounts.zoho.com/oauth/v2/token";
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
    });

    try {
      const response = await fetch(url, { method: "POST", body: params });
      const data = await response.json();

      if (data.access_token) {
        this.token = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
          expires_at: new Date(Date.now() + data.expires_in * 1000),
        };
        await this.saveTokensToDatabase();
        logger.info("Access and refresh tokens have been saved to the database");
      } else {
        logger.error("Zoho Error: Failed to obtain access token:", data);
      }
    } catch (err) {
      logger.error("Zoho Error: Error fetching access token:", err);
    }
  }

  async refreshAccessToken() {
    if (!this.token || !this.token.refresh_token) {
      throw new Error("No refresh token available");
    }

    const url = "https://accounts.zoho.com/oauth/v2/token";
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.token.refresh_token,
    });

    try {
      const response = await fetch(url, { method: "POST", body: params });
      const data = await response.json();

      if (data.access_token) {
        this.token.access_token = data.access_token;
        this.token.expires_in = data.expires_in;
        this.token.expires_at = new Date(Date.now() + data.expires_in * 1000);
        await this.saveTokensToDatabase();
      } else {
        logger.error("Zoho Error: Failed to refresh access token:", data);
      }
    } catch (err) {
      logger.error("Zoho Error: Error refreshing access token:", err);
    }
  }

  getAuthHeaders() {
    if (!this.token || !this.token.access_token) {
      throw new Error("Access token is not available");
    }
    return { Authorization: `Zoho-oauthtoken ${this.token.access_token}` };
  }

  async getRecord(module, id) {
    if (!module || !id) {
      logger.error("Zoho Error: Module and ID are required");
      return;
    }

    const url = `https://www.zohoapis.com/crm/v3/${module}/${id}`;
    logger.debug(`Fetching URL: ${url}`);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      logger.debug(`Response: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("Zoho Error: Error fetching record:", errorData);
        return;
      }

      return await response.json();
    } catch (err) {
      logger.error("Zoho Error: Error fetching record:", err);
    }
  }

  async getRelatedRecord(module, id, relatedModule, fields = []) {
    if (!module || !id || !relatedModule) {
      logger.error("Zoho Error: Module and ID are required");
      return;
    }

    fields.join(",");

    const url = `https://www.zohoapis.com/crm/v3/${module}/${id}/${relatedModule}?fields=${fields}`;
    logger.debug(`Fetching URL: ${url}`);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      logger.debug(`Response: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("Zoho Error: Error fetching record:", errorData);
        return;
      }

      return await response.json();
    } catch (err) {
      logger.error("Zoho Error: Error fetching record:", err);
    }
  }

  async updateRecord(module, id, data) {
    if (!module || !id || !data) {
      logger.error("Zoho Error: Module, ID, and data are required");
      return;
    }

    // Refresh the access token if it's expired
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    const url = `https://www.zohoapis.com/crm/v3/${module}/${id}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [data],
          trigger: [], // Add this line to prevent workflows from triggering
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        logger.error("Zoho Error: Error updating record:", responseData);
        return responseData;
      }

      return responseData;
    } catch (err) {
      logger.error("Zoho Error: Error updating record:", err);
    }
  }

  async getAllModuleRecords(module, fields = []) {
    if (!module) {
      logger.error("Zoho Error: Module is required");
      return;
    }

    let allRecords = [];
    let pageToken = null;
    let moreRecords = true;
    const perPage = 200; // Adjust as needed or make it a parameter

    while (moreRecords) {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (fields.length) {
        queryParams.append("fields", fields.join(","));
      }

      queryParams.append("per_page", perPage);

      if (pageToken) {
        queryParams.append("page_token", pageToken);
      }

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const url = `https://www.zohoapis.com/crm/v3/${module}${queryString}`;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          logger.error("Zoho Error: Error fetching module records:", errorData);
          break; // Exit the loop on error
        }

        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          allRecords = allRecords.concat(data.data);
        } else {
          logger.warn("No data found in the response.");
        }

        if (data.info) {
          moreRecords = data.info.more_records;
          pageToken = data.info.next_page_token;
        } else {
          moreRecords = false;
        }

        logger.info(`Fetched ${allRecords.length} records so far...`);
      } catch (err) {
        logger.error("Zoho Error: Error fetching module records:", err);
        break; // Exit the loop on error
      }
    }

    logger.info(`Total records fetched: ${allRecords.length}`);
    return allRecords;
  }

  async queryRecords(query) {
    const url = `https://www.zohoapis.com/crm/v7/coql`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          select_query: query,
        }),
      });

      let data = await response.json();
      return data;
    } catch (error) {
      logger.error("Zoho Error: Error querying records:", error);
    }
  }
}
