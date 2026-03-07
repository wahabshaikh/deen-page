import Link from "next/link";
import { MapPin, Github, ExternalLink } from "lucide-react";
import { BuilderBadge } from "@/components/badge";

interface BuilderCardProps {
  name: string;
  xHandle: string;
  avatar?: string;
  country?: string;
  stack: string[];
  statusTags: string[];
  slug: string;
  status: "indexed" | "verified";
}

export function BuilderCard({
  name,
  xHandle,
  avatar,
  country,
  stack,
  statusTags,
  slug,
  status,
}: BuilderCardProps) {
  return (
    <Link href={`/${slug}`} className="block group h-full">
      <div className="glass-card rounded-2xl flex flex-col h-full hover-lift border border-white/5 relative overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 inset-x-0 h-[80px] bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
        
        <div className="p-6 flex flex-col flex-grow relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-white/20 to-white/5 group-hover:from-primary/50 group-hover:to-primary/10 transition-colors duration-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-base-200">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-base-100">
                      <span className="text-xl font-display font-medium text-primary">
                        {name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-base-100 rounded-full">
                <BuilderBadge status={status} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-display font-medium text-base-content truncate group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm font-medium tracking-wide text-base-content/70 truncate">
                @{xHandle}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 flex-grow">
            {country && (
              <div className="flex items-center gap-2 text-sm text-base-content/75 font-medium">
                <MapPin size={14} className="text-base-content/55" />
                {country}
              </div>
            )}

            {stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded border border-white/5 text-base-content/60 group-hover:border-white/10 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
                {stack.length > 4 && (
                  <span className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded text-base-content/40">
                    +{stack.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {statusTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
              {statusTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
