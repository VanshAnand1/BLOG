"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreHorizontal } from "lucide-react";
import { useDeletePost } from "./delete-option";
import { useState } from "react";

type PostOptionsMenuProps = {
  postId: string;
  authorId: string | null | undefined;
  currentUserId: string;
};

export default function PostOptionsMenu({
  postId,
  authorId,
  currentUserId,
}: PostOptionsMenuProps) {
  const { deletePost, isDeleting, error } = useDeletePost({
    postId,
    authorId,
    currentUserId,
  });
  const [isCopied, setIsCopied] = useState(false);

  if (!currentUserId || !authorId || currentUserId !== authorId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) setIsCopied(false);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Post options"
            className="h-8 w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              // update link here
              //toast555
              navigator.clipboard.writeText(`localhost:3000/posts/${postId}`);
              setIsCopied(true);
            }}
          >
            {isCopied ? "Copied Link!" : "Share Post"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              if (isDeleting) {
                event.preventDefault();
                return;
              }
              deletePost();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </div>
  );
}
