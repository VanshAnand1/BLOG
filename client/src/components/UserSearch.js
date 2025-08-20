import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { NavigationBar } from "./NavigationBar";

export default function UserSearch() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

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
      axios
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
              {results.map((u) => (
                <li key={u.id}>
                  <Link
                    to={`/u/${encodeURIComponent(u.username)}`}
                    className="block rounded-xl border border-white/10 bg-white/5 p-4
                               hover:border-white/20 hover:-translate-y-[1px] hover:shadow-md
                               transition focus-visible:ring-2 focus-visible:ring-teagreen/70"
                  >
                    <span className="text-teagreen font-semibold">
                      @{u.username}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null)}
      </main>
    </div>
  );
}
