"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";

type DeleteOptionProps = {
  postId: string;
  authorId: string | null | undefined;
  currentUserId: string;
};

export default function DeleteOption({
  postId,
  authorId,
  currentUserId,
}: DeleteOptionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUserId || !authorId || currentUserId !== authorId) {
    return null;
  }

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.id !== authorId) {
        setError("You are not allowed to delete this post.");
        return;
      }

      const { data: deletedRow, error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("author_id", authorId)
        .select("id")
        .maybeSingle();

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      if (!deletedRow) {
        setError("Post not found or you do not have permission to delete it.");
        return;
      }

      if (pathname === `/posts/${postId}`) {
        router.push("/posts");
      } else {
        router.refresh();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete the post.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </div>
  );
}
