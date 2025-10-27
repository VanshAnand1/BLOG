"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export default function NewPostForm() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [footer, setFooter] = useState("");

  const handleNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      //toast555
      router.push("/auth/sign-in");
      return;
    }

    const { error } = await supabase.from("posts").insert({
      title,
      content,
      footer: footer ? footer : null,
      author_id: user.id,
    });

    if (error) {
      return <div>An error has occured {error.message}</div>;
    }
    setIsLoading(false);
    router.push(`/`);
  };

  return (
    <div>
      <form onSubmit={handleNewPost}>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <Label htmlFor="content">Content</Label>
        <Input
          id="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
        />
        <Label htmlFor="footer">Footer (optional)</Label>
        <Input
          id="footer"
          value={footer}
          onChange={(e) => {
            setFooter(e.target.value);
          }}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating post...." : "Create Post"}
        </Button>
      </form>
    </div>
  );
}
