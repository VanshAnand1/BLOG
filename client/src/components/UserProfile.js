import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const me = await axios
          .get("/me", { withCredentials: true })
          .then((r) => r.data)
          .catch(() => null);
        if (me?.username === username) {
          navigate("/profile", { replace: true });
          return;
        }
        const [uRes, pRes] = await Promise.all([
          axios.get(`/users/${encodeURIComponent(username)}`),
          axios.get(`/users/${encodeURIComponent(username)}/posts`),
        ]);
        if (!alive) return;
        setProfile(uRes.data);
        setPosts(Array.isArray(pRes.data) ? pRes.data : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.error || e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [username, navigate]);

  return (
    <div className="min-h-screen">
      <NavigationBar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="text-aliceblue/80">Loading…</div>
        ) : error ? (
          <div className="text-red-400">Error: {error}</div>
        ) : !profile ? (
          <div className="text-aliceblue/80">User not found.</div>
        ) : (
          <>
            <header className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-teagreen">
                {profile.username}&rsquo;s posts
              </h1>
              <span className="text-xs text-aliceblue/80 px-2 py-0.5 rounded-full border border-white/10">
                {posts.length}
              </span>
            </header>

            {posts.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-aliceblue/80">
                No posts yet.
              </div>
            ) : (
              <ul className="space-y-4">
                {posts.map((p) => (
                  <li key={p.id}>
                    <article
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/posts/${p.id}`)}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm cursor-pointer
                                 hover:-translate-y-[1px] hover:border-white/20 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teagreen/70"
                    >
                      <header className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Link
                            to={`/u/${encodeURIComponent(p.author)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-teagreen font-semibold hover:underline"
                          >
                            {p.author}
                          </Link>
                          <time className="block text-aliceblue/70 text-xs">
                            {formatWhen(p.createdAt)}
                            {p.updatedAt && p.updatedAt !== p.createdAt && (
                              <span className="ml-2 text-white/50">
                                (edited {formatWhen(p.updatedAt)})
                              </span>
                            )}
                          </time>
                        </div>
                      </header>
                      <p className="text-aliceblue/95 leading-relaxed whitespace-pre-wrap">
                        {p.text}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
