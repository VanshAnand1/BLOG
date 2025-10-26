"use client";
import { useState } from "react";
import { Input } from "./ui/input";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg
            className="h-5 w-5 text-white/60"
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
        <Input
          type="text"
          id="search"
          placeholder="Search..."
          value={searchQuery}
          className="w-full h-10 rounded-l-xl bg-lightgray text-white placeholder-white/50 pl-10 pr-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teagreen focus:border-transparent"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        ></Input>
      </div>
    </form>
  );
}
