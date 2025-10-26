"use client";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("User signed out successfully.");
    }
  }
  return (
    <Link
      href="/auth/login"
      onClick={handleLogout}
      className="dark:bg-teagreen dark:text-black rounded-2xl py-2 px-4 font-bold"
    >
      Logout
    </Link>
  );
}
