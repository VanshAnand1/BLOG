const BASE = "/api";

export async function fetchPostWithComments(id, signal) {
  const res = await fetch(`${BASE}/posts/${id}`, {
    signal,
    credentials: "include", // keep cookies when needed
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
