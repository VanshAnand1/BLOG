import { fetchPostWithComments } from "./Api";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(null);
  const [error, setError] = useState("");
  const post_id = Number(id);

  const [text, setText] = useState("");
  const submitHandler = (e) => {
    e.preventDefault();
    axios
      .post("/addcomment", { text, post_id }, { withCredentials: true })
      .then((data) => {
        console.log(data);
        setText("");
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        alert(err.response?.data?.error || "Add comment failed");
      });
  };

  useEffect(() => {
    const ctrl = new AbortController();
    setError("");
    setPost(null);
    setComments(null);

    fetchPostWithComments(id, ctrl.signal)
      .then(({ post, comments }) => {
        setPost(post ?? {});
        setComments(comments ?? []);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setError(String(e?.message || e));
      });

    return () => ctrl.abort();
  }, [id]);

  if (error)
    return <div style={{ padding: 16, color: "crimson" }}>Error: {error}</div>;
  if (!post || comments === null)
    return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div className="min-h-screen">
      <NavigationBar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 2-col on desktop, 1-col on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Post + comments */}
          <section className="lg:col-span-2 space-y-6">
            {/* Post card */}
            <article
              key={post.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm"
            >
              <header className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-teagreen font-semibold text-lg">
                    <Link
                      to={`/u/${encodeURIComponent(post.author)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-teagreen font-semibold hover:underline"
                    >
                      {post.author}
                    </Link>
                  </h2>
                  <time className="text-aliceblue/70 text-xs">
                    {formatWhen(post.createdAt)}
                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                      <span className="ml-2 text-white/50">
                        (edited {formatWhen(post.updatedAt)})
                      </span>
                    )}
                  </time>
                </div>
              </header>

              <p className="text-aliceblue leading-relaxed whitespace-pre-wrap text-[0.975rem]">
                {post.text}
              </p>
            </article>

            {/* Comments */}
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-aliceblue font-semibold text-lg">
                  Comments
                </h3>
                <span className="text-xs text-aliceblue/80 px-2 py-0.5 rounded-full border border-white/10">
                  {comments.length}
                </span>
              </div>

              {comments.length > 0 ? (
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li
                      key={c.id ?? `${c.postId}-${c.createdAt}`}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 transition"
                    >
                      <header className="flex items-center justify-between mb-2">
                        <h4 className="text-teagreen font-medium">
                          <Link
                            to={`/u/${encodeURIComponent(c.author)}`}
                            className="text-teagreen font-semibold hover:underline"
                          >
                            {c.author ?? "anonymous"}
                          </Link>
                        </h4>
                        <time className="text-aliceblue/70 text-xs">
                          {formatWhen(c.createdAt)}
                        </time>
                      </header>
                      <div className="whitespace-pre-wrap text-aliceblue text-[0.95rem]">
                        {c.text}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-aliceblue/70 text-sm">
                  No comments yet, be the first!
                </p>
              )}
            </article>
          </section>

          {/* RIGHT: sticky Add Comment card */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <form
              onSubmit={submitHandler}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm w-full"
            >
              <h3 className="text-center text-2xl font-semibold text-teagreen mb-5">
                Add a Comment
              </h3>

              <label
                htmlFor="text"
                className="block text-sm text-aliceblue/90 mb-2"
              >
                Comment Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                placeholder="Share your thoughts…"
                className="block w-full min-h-[120px] resize-y rounded-lg border border-white/10 bg-transparent px-3 py-2 text-aliceblue placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-teagreen focus:border-teagreen mb-5"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setText("")}
                  className="px-3 py-1.5 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="px-3 py-1.5 rounded-md bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
