import Link from "next/link";
import { ExternalLink, Github, Globe } from "lucide-react";
import { addRefParam } from "@/lib/url";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";
import { MashallahButton } from "@/components/mashallah-button";

interface ProjectCardProps {
  title: string;
  description: string;
  url: string;
  categories: string[];
  slug: string;
  githubUrl?: string;
  favicon?: string;
  builderName?: string;
  builderUsername?: string;
  mashallahCount?: number;
}

export function ProjectCard({
  title,
  description,
  url,
  categories,
  slug,
  githubUrl,
  favicon,
  builderName,
  builderUsername,
  mashallahCount,
}: ProjectCardProps) {
  return (
    <div className="card card-border glass-card bg-base-200 border-base-300 shadow-xl group h-full hover-lift rounded-box overflow-hidden transition-[transform,box-shadow,border-color] duration-300">
      <div className="card-body p-6 flex flex-col grow gap-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-base-300 border border-base-300 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-primary/30 transition-colors duration-300 shrink-0">
              {favicon ? (
                <img
                  src={favicon}
                  alt={title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <Globe size={22} className="text-base-content/50 group-hover:text-primary transition-colors duration-500" />
              )}
            </div>
            <div>
              <Link
                href={`/projects/${slug}`}
                className="text-xl font-display font-medium text-base-content group-hover:text-primary transition-colors line-clamp-1 focus-ring rounded focus:outline-none touch-manipulation"
              >
                {title}
              </Link>
              {builderName && builderUsername && (
                <Link
                  href={`/${builderUsername}`}
                  className="text-sm text-base-content/70 hover:text-base-content transition-colors flex items-center gap-1 mt-1"
                >
                  <span className="opacity-70">by</span> {builderName}
                </Link>
              )}
            </div>
          </div>
        </div>

        <p className="text-base-content/90 text-sm leading-relaxed mb-6 grow line-clamp-4">
          {description}
        </p>

        <div className="flex items-end justify-between mt-auto pt-4 border-t border-base-300">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="badge badge-sm badge-outline badge-neutral uppercase tracking-wider"
                >
                  {CATEGORY_LABELS[cat as Category] || cat}
                </span>
              ))}
              {categories.length > 2 && (
                <span className="badge badge-sm badge-ghost text-base-content/50">
                  +{categories.length - 2}
                </span>
              )}
            </div>

            <MashallahButton
              slug={slug}
              initialCount={mashallahCount ?? 0}
              compact
            />
          </div>
          <div className="flex items-center gap-1">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener"
                className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-primary focus-ring focus:outline-none touch-manipulation"
                aria-label="Open project on GitHub"
              >
                <Github size={16} />
              </a>
            )}
            <a
              href={addRefParam(url)}
              target="_blank"
              rel="noopener"
              className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-primary focus-ring focus:outline-none touch-manipulation"
              aria-label="Visit project website"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
