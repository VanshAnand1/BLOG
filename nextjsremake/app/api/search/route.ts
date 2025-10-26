import { createClient } from "@/lib/supabase/client";

export const SearchPosts = (searchQuery: string) => {
  const supabase = createClient();
  return [searchQuery, supabase];
};
