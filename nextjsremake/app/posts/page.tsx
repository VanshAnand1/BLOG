import { createClient } from "@/lib/supabase/server";

export default async function Posts() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("posts").select();

  return <pre>{JSON.stringify(posts, null, 2)}</pre>;
}
