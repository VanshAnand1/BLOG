import { ThemeSwitcher } from "@/components/template/theme-switcher";
import SearchBar from "@/components/search-bar";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col w-full">
      <div className="flex items-center justify-between gap-2 p-2 dark:bg-zomp/50 w-full">
        <div className="flex justify-between px-6 gap-10 items-center flex-1 min-w-0">
          <Link
            href="/"
            className="dark:bg-teagreen rounded-2xl py-2 dark:text-black px-4 font-bold"
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
            className="dark:bg-teagreen dark:text-black rounded-2xl py-2 px-4 font-bold"
          >
            + New Post
          </Link>
          <Link
            href="/profiles"
            className="dark:bg-teagreen dark:text-black rounded-2xl py-2 px-4 font-bold"
          >
            Profile
          </Link>
          <LogoutButton />
          <ThemeSwitcher />
        </div>
      </div>
      <div className="flex-1 w-full flex flex-col gap-20">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {children}
        </div>
      </div>
    </main>
  );
}
