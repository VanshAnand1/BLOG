import { ThemeSwitcher } from "@/components/template/theme-switcher";
import SearchBar from "@/components/search-bar";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex items-center justify-between gap-6 p-2 bg-zomp/50 w-full">
        <div className="flex justify-between px-6 gap-10 items-center">
          <Link href="/">BLOG</Link>
          <SearchBar />
        </div>
        <div className="flex justify-between px-6 gap-10 items-center">
          <Link
            href="/posts/new"
            className="bg-teagreen/80 text-black rounded-2xl py-2 px-3"
          >
            + New Post
          </Link>
          <Link
            href="/profiles"
            className="bg-teagreen/80 text-black rounded-2xl py-2 px-3"
          >
            Profile
          </Link>
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
