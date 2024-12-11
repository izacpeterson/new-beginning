export async function load() {
  let response = await fetch("http://localhost/api/errors");
  let errors = await response.json();
  return { errors };
}
