export async function handle({ event, resolve }) {
  const allowedIP = process.env.WORK_IP; // Replace with your allowed IP address

  // Try to get the client IP from headers (useful if behind a proxy)
  const forwardedFor = event.request.headers.get("x-forwarded-for");
  const clientIP = forwardedFor ? forwardedFor.split(", ")[0] : event.getClientAddress();

  // Allow only the specified IP and localhost
  const isAllowed =
    clientIP === allowedIP ||
    clientIP === "127.0.0.1" || // IPv4 localhost
    clientIP === "::1"; // IPv6 localhost

  if (!isAllowed) {
    const custom403Page = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Access Denied</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-6xl font-extrabold text-red-600">403</h1>
            <p class="text-2xl mt-4 font-semibold">Access Denied</p>
            <p class="mt-2 text-gray-400">You don't have the necessary permissions to be here.</p>
            <div class="mt-6">
              <p class="text-lg font-medium text-red-400">This incident has been logged.</p>
              <p class="text-lg text-gray-300">Leave now, or face the consequences.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    return new Response(custom403Page, {
      status: 403,
      headers: { "Content-Type": "text/html" },
    });
  }

  // If the IP is allowed, proceed with the request
  return resolve(event);
}
