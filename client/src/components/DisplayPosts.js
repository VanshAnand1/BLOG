import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";

function formatWhen(when) {
  if (!when) return "";
  const s =
    typeof when === "string" && when.includes(" ") && !when.includes("T")
      ? when.replace(" ", "T")
      : when;
  const d = new Date(s);
  return isNaN(d) ? "" : d.toLocaleString();
}

export const DisplayPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/posts")
      .then((res) => {
        console.log("posts:", res.data);
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
    <div className="min-h-screen">
      <NavigationBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-aliceblue/80">
            No posts yet — be the first to write one!
          </div>
        ) : (
          <ul className="space-y-4">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/posts/${p.id}`}
                  className="group block focus:outline-none"
                >
                  <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm transition hover:-translate-y-[1px] hover:border-white/20 hover:shadow-md focus-visible:ring-2 focus-visible:ring-teagreen/70">
                    <header className="flex items-start justify-between gap-4 mb-2">
                      <h2 className="text-teagreen font-semibold">
                        {p.author}
                      </h2>
                      <time className="text-aliceblue/70 text-xs">
                        {formatWhen(p.createdAt)}
                      </time>
                    </header>

                    <p className="text-aliceblue/95 leading-relaxed whitespace-pre-wrap">
                      {p.text}
                    </p>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
