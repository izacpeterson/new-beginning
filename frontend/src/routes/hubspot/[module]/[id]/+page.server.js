import HubSpot from "../../../../../../integrations/HubSpot";

export async function load({ params }) {
  let module = params.module;
  let id = params.id;

  const hubspot = new HubSpot();
  const properties = await hubspot.getModuleProperties(module);
  const record = await hubspot.getRecord(module, id, properties);

  return record;
}
