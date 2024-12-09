export async function load() {
  let response = await fetch("http://localhost/api/crons/status", {
    credentials: "include",
  });
  let status = await response.json();

  return { status };
}
