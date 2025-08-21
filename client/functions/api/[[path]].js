export async function onRequest({ request, env }) {
  const API = env.API_ORIGIN;
  if (!API) return new Response("API_ORIGIN not set", { status: 500 });

  const inUrl = new URL(request.url);
  const outUrl = new URL(API);
  outUrl.pathname = inUrl.pathname.replace(/^\/api/, "");
  outUrl.search = inUrl.search;

  const init = {
    method: request.method,
    headers: new Headers(request.headers),
  };
  init.headers.delete("host");
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }
  return fetch(outUrl.toString(), init);
}
