import { ExternalLink, Globe } from "lucide-react";
import { addRefParam } from "@/lib/url";

interface JobCardProps {
  companyName: string;
  companyUrl: string;
  companyFavicon?: string;
  companyDescription?: string;
  listingUrl: string;
}

export function JobCard({
  companyName,
  companyUrl,
  companyFavicon,
  companyDescription,
  listingUrl,
}: JobCardProps) {
  return (
    <div className="card card-border glass-card bg-base-200 border-base-300 shadow-xl group h-full hover-lift rounded-box overflow-hidden transition-[transform,box-shadow,border-color] duration-300">
      <div className="card-body p-6 flex flex-col grow gap-0">
        <div className="flex items-start gap-4 mb-4">
          <div className="size-12 rounded-full bg-base-300 border border-base-300 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-primary/30 transition-colors duration-300 shrink-0">
            {companyFavicon ? (
              <img
                src={companyFavicon}
                alt={companyName}
                width={48}
                height={48}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <Globe size={22} className="text-base-content/50 group-hover:text-primary transition-colors duration-500" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-display font-medium text-base-content group-hover:text-primary transition-colors line-clamp-2">
              {companyName}
            </h3>
            <p className="text-sm text-base-content/60 mt-0.5">is hiring</p>
          </div>
        </div>

        {companyDescription && (
          <p className="text-base-content/90 text-sm leading-relaxed mb-6 grow line-clamp-3">
            {companyDescription}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 mt-auto pt-4 border-t border-base-300">
          <a
            href={addRefParam(companyUrl)}
            target="_blank"
            rel="noopener"
            className="btn btn-ghost btn-sm gap-1.5 text-base-content/70 hover:text-primary focus-ring focus:outline-none touch-manipulation"
          >
            <Globe size={14} />
            Company
          </a>
          <a
            href={addRefParam(listingUrl)}
            target="_blank"
            rel="noopener"
            className="btn btn-primary btn-sm gap-1.5 focus-ring focus:outline-none touch-manipulation"
          >
            <ExternalLink size={14} />
            View jobs
          </a>
        </div>
      </div>
    </div>
  );
}
