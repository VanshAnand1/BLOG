import { ThemeSwitcher } from "@/components/theme-switcher";
import SearchBar from "@/components/search-bar";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import ProfileButton from "@/components/profile-button";
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col w-full">
      <div className="flex items-center justify-between gap-2 py-2 bg-mint dark:bg-navy w-full">
        <div className="flex justify-between px-6 gap-4 items-center flex-1 min-w-0">
          <Link
            href="/"
            className="text-white dark:hover:bg-lightgreen dark:bg-lightgreen/80 rounded-2xl py-2 dark:text-black px-4 font-bold bg-seagreen hover:bg-seagreen/80"
          >
            BLOG
          </Link>
          <div className="flex-1 min-w-0">
            <SearchBar />
          </div>
        </div>
        <div className="flex justify-between px-2 gap-6 items-center shrink-0">
          <Link
            href="/posts/new"
            className="dark:bg-teagreen/80 dark:text-black rounded-2xl py-2 px-4 font-bold bg-navy/80 hover:bg-navy/60 text-white dark:hover:bg-teagreen"
          >
            + New Post
          </Link>
          <ProfileButton />
          <LogoutButton />
          <ThemeSwitcher />
        </div>
      </div>
      <div className="flex-1 w-full flex flex-col gap-20">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5 mx-auto w-full">
          {children}
        </div>
      </div>
    </main>
  );
}
