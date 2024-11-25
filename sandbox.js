async function sandbox() {
  const cronParser = require("cron-parser");

  try {
    const interval = cronParser.parseExpression("0 */5 * * * *");
    console.log("Next execution (cron-parser):", interval.next().toString());
  } catch (error) {
    console.error("Invalid cron expression:", error.message);
  }

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

module.exports = sandbox;
