const express = require("express");
const HubSpot = require("../integrations/HubSpot.js");
const ALN = require("../integrations/ALN.js");

const logger = require("../utils/logger.js");

// const hs = new HubSpot();
const hs = new HubSpot();

const aln = new ALN();

const router = express.Router();

router.put("/records/:module/:id", (req, res) => {});

// Route to get a HubSpot record
router.get("/records/:module/:id", async (req, res) => {
  const module = req.params.module;
  const id = req.params.id;
  let properties = await hs.getModuleProperties(module);
  //   const properties = [];
  const record = await hs.getRecord(module, id, properties);

  res.json(record);
});

router.get("/properties/:module", async (req, res) => {
  const module = req.params.module;
  const properties = await hs.getModulePropertiesDetais(module);

  res.json(properties);
});

router.get("/aln/:hsid/:alnid", async (req, res) => {
  const { hsid, alnid } = req.params;

  const alnInfo = await aln.getCompany(alnid);

  if (!alnInfo || !alnInfo.Addresses || alnInfo.Addresses.length === 0) {
    res.json({});
    return;
  }

  const address = alnInfo.Addresses[0];

  let result = await hs.updateRecord("companies", hsid, {
    aln_street: address.AddressLine1 || "",
    // aln_street_2: address.AddressLine2 || '',
    aln_city: address.AddressCity || "",
    aln_state: address.AddressState || "",
    aln_zip_code: address.AddressZIP || "",
    aln_management_name: alnInfo.ManagementCompanyName || "",
    aln_property_cnt: alnInfo.OfficePropertyCount || 0,
    aln_unit_cnt: alnInfo.OfficeUnitCount || 0,
    aln_website: alnInfo.ManagementCompanyWebSite || "",
  });

  console.log(result);

  logger.info(`HubSpot Company ${hsid} ALN info updated`);

  res.json(result);

  return;
});

module.exports = router;

//126,146
