import { createClient } from "@/lib/supabase/server";
import {
  PostsCard,
  PostsCardHeader,
  PostsCardTitle,
  PostsCardDescription,
  PostsCardContent,
  PostsCardAuthor,
  PostsCardFooter,
} from "@/components/ui/post-card";
import { PostWithAuthor } from "@/types/posts";
import Link from "next/link";
import Image from "next/image";
import { datetime } from "@/lib/datetime";
import PostOptionsMenu from "@/components/post-options-menu";
import { PostLikeToggleButton } from "@/components/post-like-toggle-button";

export default async function Posts() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, content, footer, created_at, updated_at, likes_count, author:profiles!posts_author_id_fkey(display_name, avatar_url)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return <div>there was an error {error?.message}</div>;
  }

  if (!posts || posts.length === 0) {
    return <div>There were no posts</div>;
  }

  const postsTyped = posts as PostWithAuthor[];
  const currentUserId = user?.id ?? "";
  const postIds = postsTyped.map((post) => post.id);
  let likedPostIds = new Set<string>();

  if (user && postIds.length > 0) {
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);

    if (likesError) {
      return <div>there was an error {likesError.message}</div>;
    }

    likedPostIds = new Set(likes?.map((like) => like.post_id));
  }

  return (
    <div className="flex flex-col gap-6 items-stretch">
      {postsTyped.map((post) => {
        const displayName = post.author?.display_name ?? post.author_id;
        const avatarUrl = post.author?.avatar_url ?? null;
        const likedByMe = likedPostIds.has(post.id);

        return (
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
                      <span className="">
                        (edited {datetime(post.updated_at)})
                      </span>
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
        );
      })}
    </div>
  );
}
