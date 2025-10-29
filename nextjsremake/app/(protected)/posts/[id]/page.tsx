import {
  PostsCard,
  PostsCardAuthor,
  PostsCardContent,
  PostsCardDescription,
  PostsCardFooter,
  PostsCardHeader,
  PostsCardTitle,
} from "@/components/ui/post-card";
import PostOptionsMenu from "@/components/post-options-menu";
import { PostLikeToggleButton } from "@/components/post-like-toggle-button";
import { datetime } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import { PostWithAuthor } from "@/types/posts";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function SinglePost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, content, footer, created_at, updated_at, likes_count, author:profiles!posts_author_id_fkey(display_name, avatar_url)"
    )
    .eq("id", postId)
    .maybeSingle();
  if (error) {
    return <div>there was an error {error?.message}</div>;
  }
  if (!data) {
    notFound();
  }

  const post = data as PostWithAuthor;
  const currentUserId = user?.id ?? "";
  let likedByMe = false;
  if (currentUserId) {
    const { data: likedRecord } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", currentUserId)
      .eq("post_id", postId)
      .maybeSingle();
    likedByMe = Boolean(likedRecord);
  }

  const displayName = post.author?.display_name ?? post.author_id ?? "unknown";
  const avatarUrl = post.author?.avatar_url ?? null;

  return (
    <div className="flex gap-6">
      <article key={post.id} className="mx-auto w-full max-w-6xl">
        <PostsCard>
          <PostsCardHeader>
            <div className="flex justify-between mt-2 items-center">
              <Link href={`/posts/${post.id}`} className="text-2xl pt-3">
                <PostsCardTitle>{post.title}</PostsCardTitle>
              </Link>
              <div className="flex items-center gap-3">
                {datetime(post.created_at)}
                {"  "}
                {post.updated_at ? (
                  <span className="">(edited {datetime(post.updated_at)})</span>
                ) : (
                  ""
                )}
                <PostOptionsMenu
                  postId={post.id}
                  authorId={post.author_id}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
            <Link href={`/profiles/$${post.author_id}`}>
              <PostsCardAuthor className="flex gap-2">
                <div className="flex gap-3">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName ?? "avatar"}
                      className="w-6 h-6 rounded-full inline-block mr-2"
                    />
                  ) : null}
                  @{displayName}{" "}
                </div>
                <p className="text-lightgray">
                  {post.author_id === user?.id ? "(you)" : ""}
                </p>
              </PostsCardAuthor>
            </Link>
          </PostsCardHeader>
          <PostsCardContent>
            <PostsCardDescription className="text-md">
              {post.content}
            </PostsCardDescription>
          </PostsCardContent>
          {post.footer ? (
            <PostsCardFooter>TLDR: {post.footer}</PostsCardFooter>
          ) : (
            ""
          )}
          <PostLikeToggleButton
            postId={post.id}
            currentUserId={currentUserId}
            initialLiked={likedByMe}
            initialLikeCount={post.likes_count ?? 0}
          />
        </PostsCard>
      </article>
      <p>Hi</p>
      <article></article>
    </div>
  );
}
