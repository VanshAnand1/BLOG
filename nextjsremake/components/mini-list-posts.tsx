import { datetime } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import { PostWithAuthor } from "@/types/posts";
import Link from "next/link";

type MiniListPostsProps = {
  authorId: string | null | undefined;
};

type MiniPost = Pick<PostWithAuthor, "id" | "title" | "created_at">;

export default async function MiniListPosts({ authorId }: MiniListPostsProps) {
  if (!authorId) {
    return null;
  }

  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, author_id, title, created_at")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    return <div>there was an error {error.message}</div>;
  }

  if (!posts || posts.length === 0) {
    return <div>No other posts yet.</div>;
  }

  const postsTyped = posts as MiniPost[];

  const postTitleSlice = (title: string | null | undefined) => {
    if (!title) return "";
    let maxTitleLength = 27;
    if (title.length > maxTitleLength) {
      let returnTitle = title.slice(0, maxTitleLength);
      while (returnTitle[returnTitle.length - 1] === " ") {
        maxTitleLength -= 1;
        returnTitle = returnTitle.slice(0, maxTitleLength);
      }
      return returnTitle + "...";
    }
    return title;
  };

  return (
    <aside className="flex w-64 max-h-[80vh] flex-col gap-3 overflow-y-auto p-4">
      {postsTyped.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="flex flex-col gap-1 rounded-2xl bg-periwinkle text-black px-4 py-3 text-sm transition hover:bg-periwinkle/80"
        >
          <span className="font-medium text-black">
            {postTitleSlice(post.title)}
          </span>
          <span className="text-xs text-lightgray">
            {datetime(post.created_at)}
          </span>
        </Link>
      ))}
    </aside>
  );
}
