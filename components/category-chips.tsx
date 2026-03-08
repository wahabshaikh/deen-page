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

  const baseChip =
    "btn btn-sm px-6 rounded-full border transition-colors duration-300 focus-ring focus:outline-none touch-manipulation";
  const activeChip =
    "bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/20";
  const inactiveChip =
    "bg-base-200 border-base-300 text-base-content/60 hover:bg-base-300 hover:text-base-content hover:border-base-300";

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Link
        href={buildUrl(basePath, searchParams, { category: null })}
        className={`${baseChip} ${!activeCategory ? activeChip : inactiveChip}`}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={buildUrl(basePath, searchParams, { category: cat })}
          className={`${baseChip} ${activeCategory === cat ? activeChip : inactiveChip}`}
        >
          {CATEGORY_LABELS[cat as Category]}
        </Link>
      ))}
    </div>
  );
}
