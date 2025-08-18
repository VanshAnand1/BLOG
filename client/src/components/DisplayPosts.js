import { useState, useEffect } from "react";
import axios from "axios";

export const DisplayPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/posts") // proxy-enabled or full URL if you prefer
      .then((res) => {
        console.log("posts:", res.data); // 👈 verify you get data
        setPosts(res.data);
      })
      .catch((err) => {
        console.error("fetch posts failed:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-aliceblue p-4">Loading…</div>;
  if (posts.length === 0)
    return <div className="text-aliceblue p-4">No posts yet.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {posts.map((p) => (
        <article key={p.id} className="border border-aliceblue/40 p-4 rounded">
          <header className="flex justify-between mb-2">
            <h2 className="text-teagreen font-semibold">{p.author}</h2>
            <time className="text-aliceblue/70 text-sm">
              {new Date(p.createdAt).toLocaleString()}
            </time>
          </header>
          <p className="text-aliceblue leading-relaxed whitespace-pre-wrap">
            {p.text}
          </p>
        </article>
      ))}
    </div>
  );
};
