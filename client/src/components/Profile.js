import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [meRes, myPostsRes] = await Promise.all([
          axios.get("/me", { withCredentials: true }).catch(() => null),
          axios.get("/me/posts", { withCredentials: true }),
        ]);
        if (!alive) return;
        setUser(meRes?.data ?? null);
        setPosts(Array.isArray(myPostsRes.data) ? myPostsRes.data : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.error || e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div className="text-aliceblue p-4">Loading…</div>;
  if (!user)
    return <div className="text-aliceblue p-4">Sign in to see your posts.</div>;
  if (error) return <div className="text-red-400 p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen">
      <NavigationBar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-teagreen">
            {user.username}&rsquo;s posts
          </h1>
          <span className="text-xs text-aliceblue/80 px-2 py-0.5 rounded-full border border-white/10">
            {posts.length}
          </span>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-aliceblue/80">
            You haven’t posted yet.
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
}
