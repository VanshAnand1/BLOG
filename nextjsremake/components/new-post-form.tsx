"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/template/ui/card";

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
    <div className="flex flex-col gap-6">
      <Card className="bg-periwinkle text-black">
        <CardHeader>
          <CardTitle className="text-2xl">New Post</CardTitle>
          <CardDescription className="text-black">
            What&apos;s on your mind?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNewPost}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  className="border-black placeholder:text-lightgray"
                  placeholder="Big things have happened..."
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Post Content</Label>
                <textarea
                  id="content"
                  rows={8}
                  className="flex w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-lightgray"
                  placeholder="You would never believe...."
                  required
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="footer">Footer (optional)</Label>
                <textarea
                  id="footer"
                  rows={4}
                  className="flex w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-lightgray"
                  placeholder="In short..."
                  value={footer}
                  onChange={(e) => {
                    setFooter(e.target.value);
                  }}
                />
              </div>
              <div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating post...." : "Create Post"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
