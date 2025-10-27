"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";

type DeleteOptionProps = {
  post_id: string;
  author_id: string | null | undefined;
  current_user: string;
};

export default function DeleteOption({
  post_id,
  author_id,
  current_user,
}: DeleteOptionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!current_user || !author_id || current_user !== author_id) {
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

      if (!user || user.id !== author_id) {
        setError("You are not allowed to delete this post.");
        return;
      }

      const { data: deletedRow, error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", post_id)
        .eq("author_id", author_id)
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

      if (pathname === `/posts/${post_id}`) {
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
