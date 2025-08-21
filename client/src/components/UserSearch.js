import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../http";
import { NavigationBar } from "./NavigationBar";

export default function UserSearch() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [me, setMe] = useState(null);
  const [following, setFollowing] = useState(new Set());
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    api
      .get("/me")
      .then((r) => setMe(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const usernames = results.map((r) => r.username);
    const run = async () => {
      const next = new Set();
      await Promise.all(
        usernames.map(async (name) => {
          if (me && me.username?.toLowerCase() === name.toLowerCase()) return;
          try {
            const { data } = await api.get(
              `/follow/${encodeURIComponent(name)}/status`
            );
            if (data.following) next.add(name.toLowerCase());
          } catch {}
        })
      );
      setFollowing(next);
    };
    if (results.length) run();
  }, [results, me]);

  async function follow(name) {
    try {
      setToggling(name);
      await api.post(`/follow/${encodeURIComponent(name)}`, {});
      setFollowing((prev) => new Set(prev).add(name.toLowerCase()));
    } finally {
      setToggling(null);
    }
  }

  async function unfollow(name) {
    try {
      setToggling(name);
      await api.delete(`/follow/${encodeURIComponent(name)}`, {});
      setFollowing((prev) => {
        const n = new Set(prev);
        n.delete(name.toLowerCase());
        return n;
      });
    } finally {
      setToggling(null);
    }
  }

  useEffect(() => {
    const term = q.trim();
    // optional: don't search super short inputs
    // if (term.length < 2) {
    //   setResults([]);
    //   setLoading(false);
    //   return;
    // }

    setLoading(true);
    setError("");

    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      api
        .get("/users/search", { params: { q: term }, signal: ctrl.signal })
        .then((res) => setResults(Array.isArray(res.data) ? res.data : []))
        .catch((err) => {
          // ignore cancels
          if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
            return;
          setError(err?.response?.data?.error || err.message);
        })
        .finally(() => setLoading(false));
    }, 300); // debounce ms

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  return (
    <div className="min-h-screen">
      <NavigationBar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-teagreen">Find Users</h1>
          <p className="text-aliceblue/80 text-sm">Search by username</p>
        </header>

        <form onSubmit={(e) => e.preventDefault()} className="w-full">
          <div className="flex w-full">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search usernames…"
              className="flex-1 h-10 rounded-l-xl bg-lightgray text-white placeholder-white/50 px-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teagreen focus:border-transparent"
            />
            <button
              type="button"
              className="h-10 px-4 rounded-r-xl bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
            >
              Search
            </button>
          </div>
        </form>
        {loading && <div className="text-aliceblue/80">Searching…</div>}
        {error && <div className="text-red-400">Error: {error}</div>}

        {!loading &&
          !error &&
          (results.length === 0 && q.trim() ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-aliceblue/80">
              No users found for “{q.trim()}”.
            </div>
          ) : results.length > 0 ? (
            <ul className="space-y-3">
              {results.map((u) => {
                const isSelf =
                  me && me.username?.toLowerCase() === u.username.toLowerCase();
                const isFollowing = following.has(u.username.toLowerCase());
                const busy = toggling === u.username;

                return (
                  <li
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <Link
                      to={`/u/${encodeURIComponent(u.username)}`}
                      className="text-teagreen font-semibold"
                    >
                      @{u.username}
                    </Link>
                    {!isSelf &&
                      (isFollowing ? (
                        <button
                          type="button"
                          onClick={() => unfollow(u.username)}
                          disabled={busy}
                          className="px-3 py-1.5 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition disabled:opacity-60"
                        >
                          {busy ? "…" : "Unfollow"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => follow(u.username)}
                          disabled={busy}
                          className="px-3 py-1.5 rounded-md bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition disabled:opacity-60"
                        >
                          {busy ? "…" : "Follow"}
                        </button>
                      ))}
                  </li>
                );
              })}
            </ul>
          ) : null)}
      </main>
    </div>
  );
}
