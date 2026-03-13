"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { STATUS_TAGS } from "@/lib/constants";
import { buildFilterUrl } from "@/lib/url";

interface StatusTagChipsProps {
  /** Base path for links (e.g. "/builders"). */
  basePath?: string;
}

export function StatusTagChips({ basePath = "/builders" }: StatusTagChipsProps) {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("statusTag");

  const baseChip =
    "btn btn-sm px-6 rounded-full border transition-colors duration-300 focus-ring focus:outline-none touch-manipulation";
  const activeChip =
    "bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/20";
  const inactiveChip =
    "bg-base-200 border-base-300 text-base-content/60 hover:bg-base-300 hover:text-base-content hover:border-base-300";

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Link
        href={buildFilterUrl(basePath, searchParams, { statusTag: null })}
        className={`${baseChip} ${!activeTag ? activeChip : inactiveChip}`}
      >
        All
      </Link>
      {STATUS_TAGS.map((tag) => (
        <Link
          key={tag}
          href={buildFilterUrl(basePath, searchParams, { statusTag: tag })}
          className={`${baseChip} ${activeTag === tag ? activeChip : inactiveChip}`}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
