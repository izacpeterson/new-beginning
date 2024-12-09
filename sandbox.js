import { checkPassword } from "./utils/auth.js";

export default async function sandbox() {
  let res = await checkPassword("izac", "izac");
  console.log(res);
  return;
  const ALN = require("./integrations/ALN.js");
  const aln = new ALN();
  let alnInfo = await aln.getCompany("114703");

  console.log(alnInfo);
  return;
  const HubSpot = require("./integrations/HubSpot.js");
  const hs = new HubSpot();

  let result = await hs.getRecord("locations", "20550802027", ["location_name"]);
  console.log(result);

  return;
  const Zoho = require("./integrations/Zoho.js");
  const zoho = new Zoho();
  // await zoho.getAccessTokenFromCode("1000.1a01f85019a17815b53e88bdb6286470.dec0b704702b2692a893fa779373e4ed");
  // return;
  await zoho.init();

  // const records = await zoho.getAllModuleRecords("Accounts", ["Account_Name"]);

  let query = await zoho.queryRecords("select Name from Locations where Name = 'Location Test 3'");
  console.log(query);
  return;

  return;
  const auth = require("./utils/auth.js");

  let key = await auth.generateNewApiKey();
  console.log(key);

  let match = await auth.checkApiKey(key);
  console.log(match);
  return;

  const crypto = require("crypto");

  console.log(`Key: ${key} - Hashed Key: ${await auth.hashPassword(key)}`);
  return;
  //   const zoho = new Zoho();

  await zoho.init();

  const rec = await zoho.getRecord("Accounts", "2249247000231691017");
  console.log(rec);

  return;
  const fs = require("fs");
  const sqlite3 = require("sqlite3").verbose();

  // Read tokens from token.json
  let token;
  try {
    const data = fs.readFileSync("token.json", "utf-8");
    token = JSON.parse(data);
  } catch (err) {
    console.error("Error reading token.json:", err);
    process.exit(1);
  }

  if (!token) {
    console.error("No token found in token.json");
    process.exit(1);
  }

  // Open the SQLite database
  const db = new sqlite3.Database("tokens.db", (err) => {
    if (err) {
      console.error("Could not connect to tokens.db:", err);
      process.exit(1);
    }
  });

  // Initialize the tokens table if it doesn't exist
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    expires_in INTEGER,
    expires_at TEXT
  )
`;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating tokens table:", err);
      process.exit(1);
    } else {
      // Insert or update the token in the database
      const upsertQuery = `
      INSERT INTO tokens (id, access_token, refresh_token, expires_in, expires_at)
      VALUES (1, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        expires_in = excluded.expires_in,
        expires_at = excluded.expires_at
    `;

      db.run(upsertQuery, [token.access_token, token.refresh_token, token.expires_in, new Date(token.expires_at).toISOString()], function (err) {
        if (err) {
          console.error("Error inserting token into database:", err);
        } else {
          console.log("Token successfully migrated to database");
        }
        db.close();
      });
    }
  });

  return;

  //   const cronParser = require("cron-parser");

  //   try {
  //     const interval = cronParser.parseExpression("0 */5 * * * *");
  //     console.log("Next execution (cron-parser):", interval.next().toString());
  //   } catch (error) {
  //     console.error("Invalid cron expression:", error.message);
  //   }

  return;

  const record = await zoho.getRecord("Locations", "2249247000214819256");
  // console.log(record);

  //   let zohoLocations = [];
  zohoLocations.push(record.data[0]);

  // return;
  zohoLocations = await zoho.getAllModuleRecords("Locations", ["Name"]);
  // console.log(zohoLocations);
  // await zoho.getAccessTokenFromCode("1000.102e17511010f3487c3638445c64edb4.1c40a67ed3bbae43643776f62d94ac60");

  let hsrecs = await hs.getAllRecords("locations", ["zoho_location_id"]);
  // console.log(hsrecs);

  const recordsToCreate = [];

  for (const zohoLocation of zohoLocations) {
    let existsInHubspot = false;

    for (const hsLocation of hsrecs) {
      console.log(zohoLocation.id, hsLocation.properties.zoho_location_id);

      if (hsLocation.properties.zoho_location_id === zohoLocation.id) {
        console.log("Record Exists in Hubspot");
        existsInHubspot = true;
        break; // Exit the loop early since we found a match
      }
    }

    if (!existsInHubspot) {
      recordsToCreate.push({
        zoho_location_id: zohoLocation.id,
        location_name: zohoLocation.Name,
      });
    }
  }

  console.log(recordsToCreate.length);
  hs.batchCreateRecords("locations", recordsToCreate);
}

function isDifferent(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return true;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return true;
    }
  }

  return false;
}

sandbox();
