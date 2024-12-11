import HubSpot from "../../../../../../integrations/HubSpot";

export async function load({ params }) {
  let module = params.module;
  let id = params.id;
  let url = `http://localhost/api/hubspot/records/${module}/${id}`;
  console.log(url);
  let response = await fetch(url);
  let record = await response.json();

  return { record, id, module };
}
