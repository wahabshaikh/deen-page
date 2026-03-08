"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

interface SearchBarProps {
  placeholder?: string;
  /** Base path for search URL (e.g. "/builders" or "/projects"). Default "/". */
  basePath?: string;
}

export function SearchBar({
  placeholder = "Search projects and builders...",
  basePath = "/",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const path = basePath === "/" ? "/" : basePath;
      const params = new URLSearchParams(searchParams);
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.push(qs ? `${path}?${qs}` : path);
    },
    [query, router, basePath, searchParams]
  );

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-base-content/55 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="search"
          autoComplete="off"
          name="q"
          aria-label="Search projects and builders"
          className="w-full bg-transparent border-none py-4 pl-12 pr-12 text-base md:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 rounded-lg placeholder-base-content/55 text-base-content touch-manipulation"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/50 hover:text-base-content transition-colors focus-ring rounded focus:outline-none touch-manipulation"
            onClick={() => {
              setQuery("");
              const path = basePath === "/" ? "/" : basePath;
              const params = new URLSearchParams(searchParams);
              params.delete("q");
              const qs = params.toString();
              router.push(qs ? `${path}?${qs}` : path);
            }}
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
