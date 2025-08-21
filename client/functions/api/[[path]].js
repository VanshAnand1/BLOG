// client/functions/proxytest/[[test]].js
export async function onRequest({ request }) {
  const API = "overall-ilyssa-blogg-445e372e.koyeb.app/";

  const inUrl = new URL(request.url);

  // Build upstream URL: /proxytest/foo -> https://koyeb/foo
  const target =
    API.replace(/\/+$/, "") +
    inUrl.pathname.replace(/^\/proxytest/, "") +
    inUrl.search;

  // Clone request safely, strip hop-by-hop headers
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("cf-connecting-ip");
  headers.delete("x-forwarded-for");
  headers.delete("x-forwarded-host");

  const proxied = new Request(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual",
  });

  try {
    const resp = await fetch(proxied);
    return new Response(resp.body, {
      status: resp.status,
      headers: resp.headers,
    });
  } catch (err) {
    return new Response(
      "Worker proxy error: " + (err?.message || String(err)),
      {
        status: 502,
      }
    );
  }
}

// export async function onRequest({ request, env }) {
//   // TEMP debug endpoint to verify env during deploys
//   const url = new URL(request.url);
//   if (url.pathname === "/api/_env") {
//     return new Response(
//       JSON.stringify({ keys: Object.keys(env).sort() }, null, 2),
//       { headers: { "content-type": "application/json" } }
//     );
//   }

//   const API = env.API_ORIGIN;
//   if (!API) return new Response("API_ORIGIN not set", { status: 500 });

//   const out = new URL(API);
//   out.pathname = url.pathname.replace(/^\/api/, "");
//   out.search = url.search;

//   const init = {
//     method: request.method,
//     headers: new Headers(request.headers),
//   };
//   init.headers.delete("host");
//   if (!["GET", "HEAD"].includes(request.method)) {
//     init.body = await request.arrayBuffer();
//   }
//   return fetch(out.toString(), init);
// }
