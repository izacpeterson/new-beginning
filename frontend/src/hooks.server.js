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
            <title>Forbidden</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @keyframes flicker {
                0% { opacity: 1; }
                50% { opacity: 0.4; }
                100% { opacity: 1; }
              }
              .flicker { animation: flicker 1.5s infinite; }
            </style>
          </head>
          <body class="bg-black text-red-500 h-screen flex items-center justify-center">
            <div class="text-center">
              <h1 class="text-7xl font-extrabold flicker">403</h1>
              <p class="text-3xl mt-4 font-semibold">Forbidden Territory</p>
              <p class="mt-4 text-lg text-gray-300">You were never meant to find this place.</p>
              <p class="mt-2 text-lg text-red-400">Your actions have been recorded.</p>
              <div class="mt-6">
                <p class="text-xl text-gray-500">Leave now, while you still can...</p>
                <p class="mt-2 text-sm text-gray-600 italic">Something is watching you.</p>
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
