const BASE = "http://localhost:8080";

export async function fetchPostWithComments(id, signal) {
  const res = await fetch(`${BASE}/posts/${id}`, { signal });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
