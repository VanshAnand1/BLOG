"use client";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function ProfileButton() {
  const router = useRouter();
  const [username, setUsername] = useState("Guest");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setUsername("Guest");
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();
        if (!profileData) {
          setUsername("Guest");
          return;
        }
        if (!profileData.display_name) {
          setUsername("Guest");
          return;
        }

        setUsername(profileData.display_name);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, []);

  if (isLoading) {
    return <Link href="/profiles/guest">Loading....</Link>;
  }

  const handleProfileClick = async () => {
    router.push("/profiles");
  };

  return (
    <Button
      onClick={handleProfileClick}
      className="dark:bg-teagreen/80 text-md dark:text-black rounded-2xl py-2 px-4 font-bold text-white dark:hover:bg-teagreen bg-navy/80 hover:bg-navy/60"
    >
      Profile: {username}
    </Button>
  );
}
