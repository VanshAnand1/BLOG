import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../http";
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

function isInteractive(el) {
  const tag = el?.tagName?.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "button" ||
    tag === "select" ||
    el?.isContentEditable
  );
}

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [me, setMe] = useState(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isSelf =
    me &&
    profile &&
    me.username?.toLowerCase() === profile.username?.toLowerCase();

  useEffect(() => {
    axios
      .get("/me")
      .then((r) => setMe(r.data))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
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
  }, [username]);

  useEffect(() => {
    if (!profile?.username) return;
    axios
      .get(`/follow/${encodeURIComponent(profile.username)}/status`)
      .then((r) => setFollowing(!!r.data?.following))
      .catch(() => setFollowing(false));
  }, [profile?.username]);

  async function toggleFollow() {
    if (!profile?.username) return;
    setBusy(true);
    try {
      if (following) {
        await axios.delete(`/follow/${encodeURIComponent(profile.username)}`);
        setFollowing(false);
      } else {
        await axios.post(`/follow/${encodeURIComponent(profile.username)}`, {});
        setFollowing(true);
      }
    } finally {
      setBusy(false);
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setDraft(p.text || "");
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }
  async function saveEdit(id) {
    if (!draft.trim()) return alert("Text is required");
    setSaving(true);
    try {
      const { data: updated } = await axios.patch(`/posts/${id}`, {
        text: draft,
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, text: updated.text, updatedAt: updated.updatedAt }
            : p
        )
      );
      cancelEdit();
    } catch (err) {
      alert(err?.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(id) {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err?.response?.data?.error || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

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
            <header className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-2xl font-semibold text-teagreen">
                {profile.username}&rsquo;s Profile
              </h1>

              <div className="flex items-center gap-2">
                <Link
                  to={`/u/${encodeURIComponent(profile.username)}/following`}
                  className="px-3 py-1.5 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition"
                >
                  Following
                </Link>
                <Link
                  to={`/u/${encodeURIComponent(profile.username)}/followers`}
                  className="px-3 py-1.5 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition"
                >
                  Followers
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {!isSelf && me && (
                  <button
                    type="button"
                    onClick={toggleFollow}
                    disabled={busy}
                    className={
                      following
                        ? "px-3 py-1.5 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition disabled:opacity-60"
                        : "px-3 py-1.5 rounded-md bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition disabled:opacity-60"
                    }
                  >
                    {busy ? "…" : following ? "Unfollow" : "Follow"}
                  </button>
                )}
                <span className="text-xs text-aliceblue/80 px-2 py-0.5 rounded-full border border-white/10">
                  {posts.length} Posts
                </span>
              </div>
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
                      onKeyDown={(e) => {
                        if (
                          e.target !== e.currentTarget &&
                          isInteractive(e.target)
                        )
                          return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/posts/${p.id}`);
                        }
                      }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm cursor-pointer hover:-translate-y-[1px] hover:border-white/20 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teagreen/70"
                    >
                      <header className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          {p.author &&
                          p.author.toLowerCase() !== "anonymous" ? (
                            <Link
                              to={`/u/${encodeURIComponent(p.author)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-teagreen font-semibold hover:underline"
                            >
                              {p.author}
                            </Link>
                          ) : (
                            <span className="text-teagreen font-semibold">
                              {p.author ?? "anonymous"}
                            </span>
                          )}
                          <time className="block text-aliceblue/70 text-xs">
                            {formatWhen(p.createdAt)}
                            {p.updatedAt && p.updatedAt !== p.createdAt && (
                              <span className="ml-2 text-white/50">
                                (edited {formatWhen(p.updatedAt)})
                              </span>
                            )}
                          </time>
                        </div>

                        {isSelf && editingId !== p.id && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(p);
                              }}
                              className="text-xs px-2 py-1 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(p.id);
                              }}
                              disabled={deletingId === p.id}
                              className="text-xs px-2 py-1 rounded-md border border-white/10 text-red-300 hover:bg-red-500/10 hover:text-red-200 transition disabled:opacity-60"
                            >
                              {deletingId === p.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        )}
                      </header>

                      {isSelf && editingId === p.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="w-full min-h-[140px] resize-y rounded-lg border border-white/10 bg-transparent px-3 py-2 text-aliceblue focus:outline-none focus:ring-1 focus:ring-teagreen"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEdit();
                              }}
                              className="px-3 py-1.5 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveEdit(p.id);
                              }}
                              disabled={saving || !draft.trim()}
                              className="px-3 py-1.5 rounded-md bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition disabled:opacity-60"
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-aliceblue/95 leading-relaxed whitespace-pre-wrap">
                          {p.text}
                        </p>
                      )}
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
