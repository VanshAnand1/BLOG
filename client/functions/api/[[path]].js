const API_ORIGIN = process.env.SERVER_URL;

export async function onRequest({ request }) {
  const incoming = new URL(request.url);

  // Build the upstream URL: same path/query, but drop the /api prefix.
  const upstream = new URL(API_ORIGIN);
  upstream.pathname = incoming.pathname.replace(/^\/api/, "");
  upstream.search = incoming.search;

  // Forward method/headers/body
  const init = {
    method: request.method,
    headers: request.headers,
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  // Pass the response straight through (including Set-Cookie)
  return fetch(upstream.toString(), init);
}
