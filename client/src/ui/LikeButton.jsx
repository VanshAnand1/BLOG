// ui/LikeButton.jsx
import { useEffect, useState } from "react";
import api from "../http";
import { ThumbsUp } from "lucide-react";

/**
 * Props:
 * - postId: number
 * - initialLikes: number
 * - initialLikedByMe: boolean | null
 * - className?: string
 * - onAuthRequired?: () => void
 * - lazyStatus?: boolean  // default true; fetch /posts/:id/like when not already true
 */
export default function LikeButton({
  postId,
  initialLikes = 0,
  initialLikedByMe = null,
  className = "",
  onAuthRequired,
  lazyStatus = true,
}) {
  const [count, setCount] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLikedByMe === true);
  const [busy, setBusy] = useState(false);

  // keep state in sync with parent changes
  useEffect(() => {
    setLiked(initialLikedByMe === true);
  }, [initialLikedByMe]);
  useEffect(() => {
    setCount(typeof initialLikes === "number" ? initialLikes : 0);
  }, [initialLikes]);

  // ✅ lazy check even when initialLikedByMe is null or false
  useEffect(() => {
    if (!lazyStatus) return;
    if (initialLikedByMe === true) return; // already know it's liked

    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/posts/${postId}/like`, {
          withCredentials: true, // <-- send cookie just for this call
        });
        if (cancelled) return;

        // Expect: { authed: boolean, liked: boolean }
        if (data?.authed && typeof data.liked === "boolean") {
          setLiked(data.liked);
        }
        // if not authed, leave as-is (unfilled)
      } catch (err) {
        // If server requires auth and returns 401/403, treat as not signed in.
        const s = err?.response?.status;
        if (s === 401 || s === 403) return;
        // Otherwise ignore silently; user can still click
        // console.debug("like status check failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId, initialLikedByMe, lazyStatus]);

  const toggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (busy) return;

    setBusy(true);

    const wasLiked = liked;
    const wasCount = count;
    const nextLiked = !wasLiked;

    // optimistic
    setLiked(nextLiked);
    setCount(wasCount + (nextLiked ? 1 : -1));

    try {
      const resp = nextLiked
        ? await api.post(`/posts/${postId}/like`, {})
        : await api.delete(`/posts/${postId}/like`);

      const data = resp?.data || {};
      if (typeof data.liked === "boolean") setLiked(data.liked);
      if (typeof data.likes === "number") setCount(data.likes);
    } catch (err) {
      // revert
      setLiked(wasLiked);
      setCount(wasCount);

      const status = err?.response?.status;
      if (status === 401 || status === 403) onAuthRequired?.();
      else console.error("toggle like failed", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      className={
        "inline-flex items-center gap-2 text-sm select-none transition-colors " +
        (liked ? "text-teagreen" : "text-aliceblue/70 hover:text-aliceblue") +
        " disabled:opacity-60 " +
        className
      }
    >
      <ThumbsUp
        className="w-4 h-4"
        fill={liked ? "currentColor" : "none"} // filled green when liked
        stroke="currentColor"
      />
      <span>{count}</span>
    </button>
  );
}
