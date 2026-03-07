import Link from "next/link";
import { ExternalLink, Github, Globe } from "lucide-react";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";

interface ProjectCardProps {
  title: string;
  description: string;
  url: string;
  categories: string[];
  slug: string;
  githubUrl?: string;
  favicon?: string;
  builderName?: string;
  builderSlug?: string;
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
  builderSlug,
}: ProjectCardProps) {
  return (
    <div className="group glass-card rounded-2xl flex flex-col h-full hover-lift border border-white/5 relative overflow-hidden transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="p-6 flex flex-col flex-grow relative z-10">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-primary/30 transition-colors">
              {favicon ? (
                <img
                  src={favicon}
                  alt={title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <Globe size={22} className="text-base-content/50 group-hover:text-primary transition-colors duration-500" />
              )}
            </div>
            <div>
              <Link
                href={`/projects/${slug}`}
                className="text-xl font-display font-medium text-base-content group-hover:text-primary transition-colors line-clamp-1"
              >
                {title}
              </Link>
              {builderName && builderSlug && (
                <Link
                  href={`/${builderSlug}`}
                  className="text-sm text-base-content/70 hover:text-base-content transition-colors flex items-center gap-1 mt-0.5"
                >
                  <span className="opacity-70">by</span> {builderName}
                </Link>
              )}
            </div>
          </div>
        </div>

        <p className="text-base-content/85 text-sm leading-[1.65] mb-6 flex-grow line-clamp-4">
          {description}
        </p>

        <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="text-xs font-medium tracking-wider uppercase px-2.5 py-1 rounded-md bg-white/5 text-base-content/70 border border-white/5 group-hover:border-white/10 transition-colors"
              >
                {CATEGORY_LABELS[cat as Category] || cat}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="text-xs font-medium tracking-wider uppercase px-2 py-1 rounded-md bg-transparent text-base-content/40">
                +{categories.length - 2}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 hover:text-primary text-base-content/70 transition-colors"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 hover:text-primary text-base-content/70 transition-colors"
              aria-label="Visit"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
