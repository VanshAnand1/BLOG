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

export default async function Posts() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, content, footer, created_at, updated_at, author:profiles(display_name, avatar_url)"
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
    <div className="flex flex-col gap-6 items-stretch">
      {postsTyped.map((post) => {
        const displayName = post.author?.display_name ?? post.author_id;
        const avatarUrl = post.author?.avatar_url ?? null;

        return (
          <article key={post.id} className="mx-auto w-full max-w-6xl">
            <PostsCard>
              <PostsCardHeader>
                <div className="flex justify-between mt-2 items-center">
                  <Link href={`/posts/${post.id}`} className="text-2xl pt-3">
                    <PostsCardTitle>{post.title}</PostsCardTitle>
                  </Link>
                  <div>
                    {datetime(post.created_at)}
                    {"  "}
                    {post.updated_at ? (
                      <span className="">
                        (edited {datetime(post.updated_at)})
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <Link href={`/profiles/$${post.author_id}`}>
                  <PostsCardAuthor>
                    <div className="flex gap-3">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={displayName ?? "avatar"}
                          className="w-6 h-6 rounded-full inline-block mr-2"
                        />
                      ) : null}
                      @{displayName}
                    </div>
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
            </PostsCard>
          </article>
        );
      })}
    </div>
  );
}
