"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { STATUS_TAGS } from "@/lib/constants";

interface StatusTagChipsProps {
  /** Base path for links (e.g. "/builders"). */
  basePath?: string;
}

function buildUrl(basePath: string, params: URLSearchParams, overrides: Record<string, string | null>) {
  const next = new URLSearchParams(params);
  for (const [k, v] of Object.entries(overrides)) {
    if (v == null) next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function StatusTagChips({ basePath = "/builders" }: StatusTagChipsProps) {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("statusTag");

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Link
        href={buildUrl(basePath, searchParams, { statusTag: null })}
        className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 border ${
          !activeTag
            ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]"
            : "bg-white/[0.02] border-white/5 text-base-content/60 hover:bg-white/5 hover:text-base-content hover:border-white/10"
        }`}
      >
        All
      </Link>
      {STATUS_TAGS.map((tag) => (
        <Link
          key={tag}
          href={buildUrl(basePath, searchParams, { statusTag: tag })}
          className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 border ${
            activeTag === tag
              ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]"
              : "bg-white/[0.02] border-white/5 text-base-content/60 hover:bg-white/5 hover:text-base-content hover:border-white/10"
          }`}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
