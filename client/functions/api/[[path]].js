export async function onRequest({ request, env }) {
  // TEMP debug endpoint to verify env during deploys
  const url = new URL(request.url);
  if (url.pathname === "/api/_env") {
    return new Response(
      JSON.stringify({ keys: Object.keys(env).sort() }, null, 2),
      { headers: { "content-type": "application/json" } }
    );
  }

  const API = env.API_ORIGIN;
  if (!API) return new Response("API_ORIGIN not set", { status: 500 });

  const out = new URL(API);
  out.pathname = url.pathname.replace(/^\/api/, "");
  out.search = url.search;

  const init = {
    method: request.method,
    headers: new Headers(request.headers),
  };
  init.headers.delete("host");
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }
  return fetch(out.toString(), init);
}
