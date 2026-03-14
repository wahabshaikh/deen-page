import Link from "next/link";
import { BuilderBadge } from "@/components/badge";
import { upgradeTwitterProfileImage } from "@/lib/url";
import { getFlagForCountryName } from "@/lib/countries";

interface BuilderCardProps {
  name: string;
  xHandle: string;
  avatar?: string;
  country?: string;
  stack: string[];
  statusTags: string[];
  username: string;
  status: "indexed" | "verified";
}

export function BuilderCard({
  name,
  xHandle,
  avatar,
  country,
  stack,
  statusTags,
  username,
  status,
}: BuilderCardProps) {
  const countryFlag = country ? getFlagForCountryName(country) : "";
  return (
    <Link href={`/${username}`} className="block group h-full focus-ring rounded-box focus:outline-none touch-manipulation">
      <div className="card card-border glass-card bg-base-200 border-base-300 shadow-xl h-full hover-lift rounded-box overflow-hidden transition-[transform,box-shadow,border-color] duration-300 relative">
        <div className="absolute top-0 inset-x-0 h-20 bg-linear-to-b from-base-300 to-transparent pointer-events-none opacity-80 rounded-t-box" />
        <div className="card-body p-6 flex flex-col grow gap-0 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <div className="size-14 rounded-full p-0.5 bg-linear-to-br from-base-300 to-base-200 group-hover:from-primary/50 group-hover:to-primary/10 transition-colors duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-base-200">
                  {avatar ? (
                    <img
                      src={upgradeTwitterProfileImage(avatar) ?? avatar}
                      alt={name}
                      width={56}
                      height={56}
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

          <div className="flex flex-col gap-4 grow">
            {country && (
              <div className="flex items-center gap-2 text-sm text-base-content/75 font-medium">
                {countryFlag && (
                  <span className="text-base leading-none" aria-hidden>
                    {countryFlag}
                  </span>
                )}
                {country}
              </div>
            )}

            {stack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="badge badge-xs badge-outline badge-neutral uppercase"
                  >
                    {tech}
                  </span>
                ))}
                {stack.length > 4 && (
                  <span className="badge badge-xs badge-ghost text-base-content/50">
                    +{stack.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {statusTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-base-300">
              {statusTags.map((tag) => (
                <span key={tag} className="badge badge-sm badge-primary badge-outline">
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
