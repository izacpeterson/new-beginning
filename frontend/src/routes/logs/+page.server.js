export async function load() {
  let response = await fetch("http://localhost/api/logs");
  let logs = await response.json();

  return { logs };
}
