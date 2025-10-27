"use client";

import { useCallback, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostsCardLikeButton } from "./ui/post-card";

type PostLikeToggleButtonProps = {
  postId: string;
  currentUserId: string | null | undefined;
  initialLiked: boolean;
  initialLikeCount: number;
};

export function PostLikeToggleButton({
  postId,
  currentUserId,
  initialLiked,
  initialLikeCount,
}: PostLikeToggleButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  const handleToggle = useCallback(() => {
    if (!currentUserId || isPending) {
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const previousLiked = liked;
      const previousCount = likeCount;
      const nextLiked = !previousLiked;
      const delta = nextLiked ? 1 : -1;
      const nextCount = Math.max(0, previousCount + delta);

      setLiked(nextLiked);
      setLikeCount(nextCount);

      const toggleResponse = nextLiked
        ? await supabase
            .from("likes")
            .insert({ post_id: postId, user_id: currentUserId })
        : await supabase
            .from("likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", currentUserId);

      if (toggleResponse.error) {
        setLiked(previousLiked);
        setLikeCount(previousCount);
        console.error("Failed to toggle like", toggleResponse.error);
        return;
      }

      const { error: countError } = await supabase
        .from("posts")
        .update({ likes_count: nextCount })
        .eq("id", postId);

      if (countError) {
        setLiked(previousLiked);
        setLikeCount(previousCount);

        if (nextLiked) {
          await supabase
            .from("likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", currentUserId);
        } else {
          await supabase
            .from("likes")
            .insert({ post_id: postId, user_id: currentUserId });
        }

        console.error("Failed to update like count", countError);
      }
    });
  }, [currentUserId, isPending, likeCount, liked, postId]);

  return (
    <PostsCardLikeButton
      liked={liked}
      likeCount={likeCount}
      onClick={handleToggle}
      disabled={isPending || !currentUserId}
    />
  );
}
