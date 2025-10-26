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

export default async function Posts() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, content, created_at, updated_at, author:profiles(display_name, avatar_url)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return <div>there was an error {error?.message} </div>;
  }

  if (!posts || posts.length === 0) {
    return <div>There were no posts</div>;
  }

  const postsTyped = posts as PostWithAuthor[];

  return (
    <div className="flex flex-col gap-6">
      {postsTyped.map((post) => {
        const displayName = post.author?.display_name ?? post.author_id;
        const avatarUrl = post.author?.avatar_url ?? null;

        return (
          <article key={post.id} className="">
            <PostsCard>
              <PostsCardHeader>
                <Link href={`/profiles/$${post.author_id}`}>
                  <PostsCardAuthor>
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName ?? "avatar"}
                        className="w-6 h-6 rounded-full inline-block mr-2"
                      />
                    ) : null}
                    {displayName}
                  </PostsCardAuthor>
                </Link>
                <Link href={`/posts/${post.id}`}>
                  <PostsCardTitle>{post.title}</PostsCardTitle>
                </Link>
              </PostsCardHeader>
              <PostsCardContent>
                <PostsCardDescription>{post.content}</PostsCardDescription>
              </PostsCardContent>
              <PostsCardFooter>Footer</PostsCardFooter>
            </PostsCard>
          </article>
        );
      })}
    </div>
  );
}
