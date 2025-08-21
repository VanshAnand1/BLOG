export async function onRequest({ request, env }) {
  try {
    const API = env.API_ORIGIN;
    if (!API) return new Response("API_ORIGIN not set", { status: 500 });

    const inUrl = new URL(request.url);
    const target =
      API.replace(/\/+$/, "") +
      inUrl.pathname.replace(/^\/api/, "") +
      inUrl.search;

    // clone headers safely
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("content-length");
    headers.delete("cf-connecting-ip");
    headers.delete("x-forwarded-for");
    headers.delete("x-forwarded-host");

    // read body once for POST/PATCH/DELETE…
    const body = ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer();

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    // return upstream as-is (preserves Set-Cookie etc.)
    return upstream;
  } catch (e) {
    console.error("Worker proxy error:", e);
    return new Response("Worker proxy error: " + (e?.message || String(e)), {
      status: 502,
    });
  }
}
