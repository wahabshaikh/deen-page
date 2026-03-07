"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";

interface CategoryChipsProps {
  /** Base path for category links (e.g. "/projects"). Default "/". */
  basePath?: string;
}

function buildUrl(basePath: string, params: URLSearchParams, overrides: Record<string, string | null>) {
  const next = new URLSearchParams(params);
  for (const [k, v] of Object.entries(overrides)) {
    if (v == null) next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  const path = basePath === "/" ? "/" : basePath;
  return qs ? `${path}?${qs}` : path;
}

export function CategoryChips({ basePath = "/" }: CategoryChipsProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Link
        href={buildUrl(basePath, searchParams, { category: null })}
        className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 border ${
          !activeCategory
            ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]"
            : "bg-white/[0.02] border-white/5 text-base-content/60 hover:bg-white/5 hover:text-base-content hover:border-white/10"
        }`}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={buildUrl(basePath, searchParams, { category: cat })}
          className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 border ${
            activeCategory === cat
              ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]"
              : "bg-white/[0.02] border-white/5 text-base-content/60 hover:bg-white/5 hover:text-base-content hover:border-white/10"
          }`}
        >
          {CATEGORY_LABELS[cat as Category]}
        </Link>
      ))}
    </div>
  );
}
