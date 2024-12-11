import { checkPassword, upsertObject } from "./utils/auth.js";
import Zoho from "./integrations/Zoho.js";
export default async function sandbox() {
  let zoho = new Zoho();
  await zoho.init();

  // let records = await zoho.getAllModuleRecords("Accounts", ["id"]);
  // console.log(records);

  return;
}

sandbox();
