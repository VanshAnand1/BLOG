import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../http";
import { NavigationBar } from "./NavigationBar";

// Reusable page for either "followers" or "following"
export default function FollowListPage({ type }) {
  const { username } = useParams(); // from /u/:username/followers or /u/:username/following
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [followingSet, setFollowingSet] = useState(new Set());

  const isSelf =
    me?.username &&
    username &&
    me.username.toLowerCase() === username.toLowerCase();

  // who am I
  useEffect(() => {
    api
      .get("/me")
      .then((r) => setMe(r.data))
      .catch(() => setMe(null));
  }, []);

  // fetch list
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    api
      .get(`/users/${encodeURIComponent(username)}/${type}`)
      .then((r) => {
        if (alive) setRows(Array.isArray(r.data) ? r.data : []);
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
  }, [username, type]);

  // build followingSet for action buttons on "my" lists
  useEffect(() => {
    if (!isSelf) return;
    if (type === "following") {
      setFollowingSet(new Set(rows.map((r) => r.username.toLowerCase())));
      return;
    }
    (async () => {
      const s = new Set();
      await Promise.all(
        rows.map(async (r) => {
          try {
            const { data } = await api.get(
              `/follow/${encodeURIComponent(r.username)}/status`
            );
            if (data.following) s.add(r.username.toLowerCase());
          } catch {}
        })
      );
      setFollowingSet(s);
    })();
  }, [rows, type, isSelf]);

  async function follow(name) {
    setBusy(name);
    try {
      await api.post(`/follow/${encodeURIComponent(name)}`, {});
      setFollowingSet((prev) => new Set(prev).add(name.toLowerCase()));
    } finally {
      setBusy(null);
    }
  }

  async function unfollow(name) {
    setBusy(name);
    try {
      await api.delete(`/follow/${encodeURIComponent(name)}`, {});
      setFollowingSet((prev) => {
        const n = new Set(prev);
        n.delete(name.toLowerCase());
        return n;
      });
      if (isSelf && type === "following") {
        // remove from the list immediately when viewing "following"
        setRows((prev) =>
          prev.filter((r) => r.username.toLowerCase() !== name.toLowerCase())
        );
      }
    } finally {
      setBusy(null);
    }
  }

  async function removeFollower(name) {
    setBusy(name);
    try {
      await api.delete(`/followers/${encodeURIComponent(name)}`, {});
      setRows((prev) =>
        prev.filter((r) => r.username.toLowerCase() !== name.toLowerCase())
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen">
      <NavigationBar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-teagreen">
            {type === "following" ? (
              <>
                @{username}&rsquo;s following: {rows.length}
              </>
            ) : (
              <>
                @{username}&rsquo;s followers: {rows.length}
              </>
            )}
          </h1>
          <div className="flex gap-2">
            <Link
              to={`/u/${encodeURIComponent(username)}/following`}
              className={`px-3 py-1.5 rounded-md border border-aliceblue/10 text-teagreen ${
                type === "following" ? "bg-white/10" : ""
              }`}
            >
              Following
            </Link>
            <Link
              to={`/u/${encodeURIComponent(username)}/followers`}
              className={`px-3 py-1.5 rounded-md border border-aliceblue/10 text-teagreen ${
                type === "followers" ? "bg-white/10" : ""
              }`}
            >
              Followers
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="text-aliceblue/80">Loading…</div>
        ) : error ? (
          <div className="text-red-400">Error: {error}</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-aliceblue/80">
            No {type}.
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((u) => {
              const name = u.username;
              const iFollow = followingSet.has(name.toLowerCase());
              const showActions = isSelf;
              return (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <Link
                    to={`/u/${encodeURIComponent(name)}`}
                    className="text-teagreen font-semibold"
                  >
                    @{name}
                  </Link>

                  {showActions &&
                    (type === "followers" ? (
                      <button
                        type="button"
                        onClick={() => removeFollower(name)}
                        disabled={busy === name}
                        className="px-3 py-1.5 rounded-md border border-white/10 text-red-300 hover:bg-red-500/10 hover:text-red-200 transition disabled:opacity-60"
                      >
                        {busy === name ? "…" : "Remove"}
                      </button>
                    ) : iFollow ? (
                      <button
                        type="button"
                        onClick={() => unfollow(name)}
                        disabled={busy === name}
                        className="px-3 py-1.5 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition disabled:opacity-60"
                      >
                        {busy === name ? "…" : "Unfollow"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => follow(name)}
                        disabled={busy === name}
                        className="px-3 py-1.5 rounded-md bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition disabled:opacity-60"
                      >
                        {busy === name ? "…" : "Follow"}
                      </button>
                    ))}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
