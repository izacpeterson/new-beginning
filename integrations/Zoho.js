const fs = require("fs");

class Zoho {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.token = null;
  }

  async init() {
    await this.loadTokensFromFile();
    if (!this.token || this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
  }

  async loadTokensFromFile() {
    try {
      const data = fs.readFileSync("token.json", "utf-8");
      this.token = JSON.parse(data);
    } catch (err) {
      console.error("Error loading token from file:", err);
    }
  }

  saveTokensToFile() {
    try {
      fs.writeFileSync("token.json", JSON.stringify(this.token, null, 2));
    } catch (err) {
      console.error("Error saving token to file:", err);
    }
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
        this.saveTokensToFile();
        console.log("Access and refresh tokens have been saved to token.json");
      } else {
        console.error("Failed to obtain access token:", data);
      }
    } catch (err) {
      console.error("Error fetching access token:", err);
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
        this.saveTokensToFile();
      } else {
        console.error("Failed to refresh access token:", data);
      }
    } catch (err) {
      console.error("Error refreshing access token:", err);
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
      console.error("Module and ID are required");
      return;
    }

    const url = `https://www.zohoapis.com/crm/v3/${module}/${id}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching record:", errorData);
        return;
      }

      return await response.json();
    } catch (err) {
      console.error("Error fetching record:", err);
    }
  }

  async getAllModuleRecords(module, fields = []) {
    if (!module) {
      console.error("Module is required");
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
          console.error("Error fetching module records:", errorData);
          break; // Exit the loop on error
        }

        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          allRecords = allRecords.concat(data.data);
        } else {
          console.warn("No data found in the response.");
        }

        if (data.info) {
          moreRecords = data.info.more_records;
          pageToken = data.info.next_page_token;
        } else {
          moreRecords = false;
        }

        console.log(`Fetched ${allRecords.length} records so far...`);
      } catch (err) {
        console.error("Error fetching module records:", err);
        break; // Exit the loop on error
      }
    }

    console.log(`Total records fetched: ${allRecords.length}`);
    return allRecords;
  }
}

module.exports = Zoho;
