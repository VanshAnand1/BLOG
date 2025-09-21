import { useState, useEffect } from "react";
import api from "../http";
import { Link, useNavigate } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";
import LikeButton from "../ui/LikeButton";
import { useToast } from "../ui/ToastProvider";

function formatWhen(when) {
  if (!when) return "";
  const d = when instanceof Date ? when : new Date(when);
  return isNaN(d) ? "" : d.toLocaleString();
}

export const DisplayPosts = () => {
  const navigate = useNavigate();
  const [feed, setFeed] = useState("global"); // "following" | "global"
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const toast = useToast();

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const url = feed === "global" ? "/posts" : "/followingposts";

        // Do not throw on any status code — we decide what to do
        const res = await api.get(url, { validateStatus: () => true });

        if (!alive) return;

        if (res.status === 200 && Array.isArray(res.data)) {
          setPosts(res.data);
          setErr("");
        } else if (res.status === 401 && feed === "following") {
          // Not signed in: auto-switch to Global so the user actually sees posts
          setFeed("global");
          return; // let the next effect run
        } else {
          const msg =
            res?.data?.error || `Failed to load (${res.status || "network"})`;
          setErr(msg);
          setPosts([]);
        }
      } catch (e) {
        if (!alive) return;
        const msg = e?.response?.data?.error || e.message || "Failed to load";
        setErr(msg);
        setPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [feed]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <NavigationBar />

      <main className="max-w-4xl mx-auto px-3 lg:px-4 py-6 lg:py-8">
        {/* Feed toggle — full width on small screens, pills on larger */}
        <div className="mb-5 lg:mb-6 w-full sm:w-auto">
          <div className="flex w-full sm:w-auto rounded-lg border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setFeed("following")}
              className={
                "flex-1 min-w-0 text-center px-3 sm:px-4 h-9 sm:h-10 " +
                (feed === "following"
                  ? "bg-teagreen/90 text-[#0b1321] font-medium"
                  : "bg-white/5 text-aliceblue/90 hover:bg-white/10")
              }
            >
              Following
            </button>
            <button
              type="button"
              onClick={() => setFeed("global")}
              className={
                "flex-1 min-w-0 text-center px-3 sm:px-4 h-9 sm:h-10 " +
                (feed === "global"
                  ? "bg-teagreen/90 text-[#0b1321] font-medium"
                  : "bg-white/5 text-aliceblue/90 hover:bg-white/10")
              }
            >
              Global
            </button>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="text-aliceblue/80">Loading…</div>
        ) : err ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 lg:p-6 text-center text-red-200">
            {err}
            {feed === "following" && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setFeed("global")}
                  className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-4 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
                >
                  View Global feed
                </button>
              </div>
            )}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 lg:py-16 flex items-center justify-center">
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 lg:p-10 text-center">
              <p className="text-aliceblue/80">
                {feed === "following"
                  ? "No posts from people you follow yet."
                  : "No posts yet — be the first to write one!"}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/addpost"
                  className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-4 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
                >
                  + New Post
                </Link>
                {feed === "following" && (
                  <button
                    type="button"
                    onClick={() => setFeed("global")}
                    className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-4 rounded-lg border border-white/10 text-aliceblue/90 hover:bg-white/10 transition"
                  >
                    See Global feed
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {posts.map((p) => (
              <li key={p.id}>
                <article
                  role="link"
                  tabIndex={0}
                  aria-label={`Open post by ${p.author}`}
                  onClick={() => navigate(`/posts/${p.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/posts/${p.id}`);
                    }
                  }}
                  className="group block rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-5 shadow-sm transition hover:-translate-y-[1px] hover:border-white/20 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teagreen/70 cursor-pointer"
                >
                  <header className="flex items-start justify-between gap-3 lg:gap-4 mb-2 flex-wrap">
                    <h2 className="text-teagreen font-semibold min-w-0">
                      <Link
                        to={`/u/${encodeURIComponent(p.author)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-teagreen font-semibold hover:underline truncate"
                      >
                        {p.author}
                      </Link>
                    </h2>
                    <time className="text-aliceblue/70 text-xs sm:text-sm">
                      {formatWhen(p.createdAt)}
                      {p.updatedAt && p.updatedAt !== p.createdAt && (
                        <span className="ml-2 text-white/50">
                          (edited {formatWhen(p.updatedAt)})
                        </span>
                      )}
                    </time>
                  </header>

                  <p className="text-aliceblue/95 leading-relaxed whitespace-pre-wrap break-words">
                    {p.text}
                  </p>
                  <div className="mt-3">
                    <LikeButton
                      postId={p.id}
                      initialLikes={p.likes ?? 0}
                      initialLikedByMe={p.likedByMe ?? null}
                      onAuthRequired={() =>
                        toast.error("Please sign in to like posts")
                      }
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
