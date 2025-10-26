"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search/${searchQuery}`);
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="flex w-full">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg
              className="h-5 w-5 text-black/60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </span>
          <input
            type="text"
            id="search"
            placeholder="Search..."
            value={searchQuery}
            className="w-full h-10 rounded-l-xl bg-neutral-500 text-white placeholder-white/50 pl-10 pr-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teagreen focus:border-transparent"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          ></input>
        </div>
        <button
          type="submit"
          className="h-10 px-4 rounded-r-xl bg-teagreen/60 text-[#0b1321] font-medium hover:bg-teagreen/80 transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}
