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
        <Link href="/">BLOG</Link>
        <SearchBar />
        <ThemeSwitcher />
      </div>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {children}
        </div>
      </div>
    </main>
  );
}
