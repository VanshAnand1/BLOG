import { fetchPostWithComments } from "./Api";
import { useEffect, useId, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../http";
import { NavigationBar } from "./NavigationBar";
import { useToast } from "../ui/ToastProvider";
import LikeButton from "../ui/LikeButton";

function formatWhen(when) {
  if (!when) return "";
  const d = when instanceof Date ? when : new Date(when);
  return isNaN(d) ? "" : d.toLocaleString();
}

// Match Tailwind's lg breakpoint
function useMediaQuery(query) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener
      ? mql.addEventListener("change", onChange)
      : mql.addListener(onChange);
    setMatches(mql.matches);
    return () => {
      mql.removeEventListener
        ? mql.removeEventListener("change", onChange)
        : mql.removeListener(onChange);
    };
  }, [query]);
  return matches;
}

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(null);
  const [error, setError] = useState("");
  const post_id = Number(id);
  const toast = useToast();

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

  const isLg = useMediaQuery("(min-width: 1024px)");

  if (error)
    return <div style={{ padding: 16, color: "crimson" }}>Error: {error}</div>;
  if (!post || comments === null)
    return <div style={{ padding: 16 }}>Loading…</div>;

  // --- AddCommentForm: UNCONTROLLED textarea to prevent focus loss ---
  function AddCommentForm({ className = "" }) {
    const textareaRef = useRef(null);
    const [hasText, setHasText] = useState(false);
    const idFor = useId(); // avoid any id collisions
    const taId = `${idFor}-comment-text`;

    const handleInput = (e) => {
      setHasText(e.currentTarget.value.trim().length > 0);
    };

    const handleCancel = () => {
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.focus();
      }
      setHasText(false);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const text = textareaRef.current?.value ?? "";
      const trimmed = text.trim();
      if (!trimmed) return;
      try {
        await api.post("/addcomment", { text: trimmed, post_id });
        if (textareaRef.current) textareaRef.current.value = "";
        setHasText(false);
        window.location.reload();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || "Add comment failed");
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-6 shadow-sm w-full ${className}`}
      >
        <h3 className="text-center text-xl lg:text-2xl font-semibold text-teagreen mb-4 lg:mb-5">
          Add a Comment
        </h3>

        <label htmlFor={taId} className="block text-sm text-aliceblue/90 mb-2">
          Comment Text
        </label>
        <textarea
          id={taId}
          ref={textareaRef}
          defaultValue=""
          onInput={handleInput}
          placeholder="Share your thoughts…"
          className="block w-full min-h-[72px] lg:min-h-[120px] resize-y rounded-lg border border-white/10 bg-transparent px-3 py-2 text-aliceblue placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-teagreen focus:border-teagreen mb-4 lg:mb-5"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!hasText}
            className="px-3 py-1.5 rounded-md bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </form>
    );
  }
  // -------------------------------------------------------------------

  return (
    <div className="min-h-screen overflow-x-hidden">
      <NavigationBar />

      <div className="max-w-6xl mx-auto px-3 lg:px-4 py-5 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
          {/* LEFT: Post + (mobile form) + Comments */}
          <section className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Post card */}
            <article
              key={post.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-6 shadow-sm"
            >
              <header className="flex items-start justify-between gap-4 mb-2 lg:mb-3">
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
              <div className="mt-3">
                <LikeButton
                  postId={post.id}
                  initialLikes={post.likes ?? 0}
                  initialLikedByMe={post.likedByMe ?? null}
                  onAuthRequired={() =>
                    toast.error("Please sign in to like posts")
                  }
                />
              </div>
            </article>

            {/* MOBILE/TABLET: form ABOVE comments */}
            {!isLg && <AddCommentForm />}

            {/* Comments */}
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h3 className="text-aliceblue font-semibold text-lg">
                  Comments
                </h3>
                <span className="text-xs text-aliceblue/80 px-2 py-0.5 rounded-full border border-white/10">
                  {comments.length}
                </span>
              </div>

              {comments.length > 0 ? (
                <ul className="space-y-3 lg:space-y-4">
                  {comments.map((c) => (
                    <li
                      key={c.id ?? `${c.postId}-${c.createdAt}`}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3 lg:p-4 hover:border-white/20 transition"
                    >
                      <header className="flex items-center justify-between mb-1.5 lg:mb-2">
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

          {/* DESKTOP: sticky form on the right */}
          {isLg && (
            <aside className="lg:sticky lg:top-24 h-fit">
              <AddCommentForm />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
