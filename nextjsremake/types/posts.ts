export type ProfileMini = {
  display_name?: string | null;
  avatar_url?: string | null;
};

export type PostSchema = {
  id: string;
  author_id?: string | null;
  title?: string | null;
  content?: string | null;
  footer?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  author?: ProfileMini | null;
};

export type PostWithAuthor = PostSchema;
