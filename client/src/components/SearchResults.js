import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../http";
import { NavigationBar } from "./NavigationBar";
import LikeButton from "../ui/LikeButton";
import { useToast } from "../ui/ToastProvider";

function formatWhen(when) {
  if (!when) return "";
  const d = when instanceof Date ? when : new Date(when);
  return isNaN(d) ? "" : d.toLocaleString();
}

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  useEffect(() => {
    let alive = true;
    if (!q) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");
    api
      .get("/search", { params: { q } })
      .then((res) => {
        if (alive) setResults(Array.isArray(res.data) ? res.data : []);
      })
      .catch((e) => {
        if (alive) setError(e?.response?.data?.error || e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [q]);

  return (
    <div className="min-h-screen">
      <NavigationBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-teagreen">Search</h1>
          <p className="text-aliceblue/80 text-sm">
            {q ? (
              <>
                Results for <span className="text-white/95">“{q}”</span>
              </>
            ) : (
              "Type a query and hit search"
            )}
          </p>
        </header>

        {loading ? (
          <div className="text-aliceblue/80">Loading…</div>
        ) : error ? (
          <div className="text-red-400">Error: {error}</div>
        ) : !q ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-aliceblue/80">
            Enter a search term above.
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-aliceblue/80">
            No results for “{q}”.
          </div>
        ) : (
          <ul className="space-y-4">
            {results.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/posts/${p.id}`}
                  className="group block focus:outline-none"
                >
                  <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm transition hover:-translate-y-[1px] hover:border-white/20 hover:shadow-md focus-visible:ring-2 focus-visible:ring-teagreen/70">
                    <header className="flex items-start justify-between gap-4 mb-2">
                      <h2 className="text-teagreen font-semibold">
                        <Link
                          to={`/u/${encodeURIComponent(p.author)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-teagreen font-semibold hover:underline"
                        >
                          {p.author}
                        </Link>
                      </h2>
                      <time className="text-aliceblue/70 text-xs">
                        {formatWhen(p.updatedAt || p.createdAt)}
                        {p.updatedAt && p.updatedAt !== p.createdAt && (
                          <span className="ml-2 text-white/50">
                            (edited {formatWhen(p.updatedAt)})
                          </span>
                        )}
                      </time>
                    </header>
                    <p className="text-aliceblue/95 leading-relaxed whitespace-pre-wrap">
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
