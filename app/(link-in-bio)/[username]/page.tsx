import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { Project } from "@/lib/models/project";
import type { Metadata } from "next";
import { ExternalLinkIcon, GlobeIconComponent, GithubIconComponent, HeartIcon } from "@/components/icons";
import { upgradeTwitterProfileImage } from "@/lib/url";
import { getFlagForCountryName } from "@/lib/countries";

interface PageProps {
  params: Promise<{ username: string }>;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function getFaviconUrl(url: string): string {
  const domain = getDomain(url);
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  await connectDB();
  const builder = await Builder.findOne({ username }).lean();

  if (!builder) return { title: "Builder Not Found" };

  const description = builder.bio
    ? `${builder.name} — ${builder.bio}`
    : `${builder.name} (@${builder.xHandle}) — builder on deen.page (Muslim Builders & Islamic Projects).`;

  return {
    title: builder.name,
    description,
    openGraph: {
      title: `${builder.name} | deen.page`,
      description,
      images: [`/api/og?type=builder&slug=${username}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${builder.name} | deen.page`,
      description,
      images: [`/api/og?type=builder&slug=${username}`],
    },
  };
}

export default async function LinkInBioPage({ params }: PageProps) {
  const { username } = await params;
  await connectDB();

  const builder = await Builder.findOne({ username }).lean();
  if (!builder) notFound();

  // Fetch builder's projects
  const projects = await Project.find({ builderId: builder._id, isPublic: true }).sort({ createdAt: -1 }).lean();

  const countryFlag = builder.country
    ? getFlagForCountryName(builder.country)
    : "";

  const links = builder.links || [];
  const socialUrls = builder.socialUrls || [];
  const theme = builder.theme || "deen";

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content transition-colors duration-300" data-theme={theme}>
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-12 sm:py-16 relative">
        {/* Background decorative gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Profile Section */}
        <div className="w-full max-w-md flex flex-col items-center text-center mb-8 animate-fade-in-up">
          {/* Avatar */}
          <div className="relative mb-5">
            <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-br from-primary/40 to-secondary/30">
              <div className="w-full h-full rounded-full overflow-hidden bg-base-200 border-[3px] border-base-100">
                {builder.avatar ? (
                  <img
                    src={
                      upgradeTwitterProfileImage(builder.avatar) ?? builder.avatar
                    }
                    alt={builder.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl font-display font-medium text-primary">
                      {builder.name[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-display font-semibold mb-1">
            {builder.name}
          </h1>

          {/* Handle & Location */}
          <div className="flex items-center gap-2 text-sm text-base-content/60 mb-3">
            <a
              href={`https://x.com/${builder.xHandle}`}
              target="_blank"
              rel="noopener"
              className="hover:text-primary transition-colors"
            >
              @{builder.xHandle}
            </a>
            {builder.country && (
              <>
                <span className="w-1 h-1 rounded-full bg-base-content/20" />
                <span>
                  {countryFlag && (
                    <span className="mr-1" aria-hidden>
                      {countryFlag}
                    </span>
                  )}
                  {builder.country}
                </span>
              </>
            )}
          </div>

          {/* Bio */}
          {builder.bio && (
            <p className="text-base-content/70 text-sm leading-relaxed max-w-sm mb-4">
              {builder.bio}
            </p>
          )}

          {/* Status Tags */}
          {builder.statusTags && builder.statusTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {builder.statusTags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Social Icons */}
          {(() => {
            const displaySocials = [...socialUrls];
            if (builder.xHandle && !displaySocials.some(s => s.url.toLowerCase().includes('x.com') || s.url.toLowerCase().includes('twitter.com'))) {
              displaySocials.unshift({ url: `https://x.com/${builder.xHandle}` });
            }
            if (displaySocials.length === 0) return null;

            return (
              <div className="flex items-center justify-center gap-3 mb-6">
                {displaySocials.map((social: { url: string }, index: number) => {
                  const favicon = getFaviconUrl(social.url);
                  const domain = getDomain(social.url);
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener"
                      className="w-10 h-10 rounded-full bg-base-200 border border-base-300 flex items-center justify-center hover:border-primary/40 hover:scale-110 transition-all duration-200"
                      aria-label={domain || "Social link"}
                      title={domain || "Social link"}
                    >
                      {favicon ? (
                        <img
                          src={favicon}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-sm"
                        />
                      ) : (
                        <ExternalLinkIcon size={16} className="text-base-content/60" />
                      )}
                    </a>
                  );
                })}
              </div>
            );
          })()}

          {/* Special Primary Links (Website & Support) */}
          {(builder.websiteUrl || builder.supportLink) && (
            <div className="flex flex-col w-full gap-3 mb-8">
              {builder.websiteUrl && (
                <a
                  href={builder.websiteUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-primary btn-outline w-full rounded-2xl gap-3 normal-case font-display text-base"
                >
                  <GlobeIconComponent size={18} />
                  Visit Website
                </a>
              )}
              {builder.supportLink && (
                <a
                  href={builder.supportLink}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary w-full rounded-2xl gap-3 normal-case font-display text-base shadow-lg shadow-secondary/20"
                >
                  <HeartIcon size={18} className="fill-current" />
                  Support my Work
                </a>
              )}
            </div>
          )}
        </div>

        {/* Combined Projects & Links Section */}
        <div className="w-full max-w-md flex flex-col gap-4 animate-fade-in-up delay-200">
          
          {/* Projects Sub-section */}
          {projects.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-base-content/40 px-1">Projects</h2>
              {projects.map((project) => (
                <div 
                  key={project._id.toString()}
                  className="card bg-base-200/50 border border-base-300 hover:border-primary/30 transition-all duration-200 overflow-hidden"
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {project.favicon && (
                          <img
                            src={project.favicon}
                            alt=""
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-lg shrink-0"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-base line-clamp-1">{project.title}</h3>
                          <p className="text-xs text-base-content/60 line-clamp-1">{project.description}</p>
                        </div>
                      </div>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener"
                        className="btn btn-circle btn-ghost btn-xs"
                      >
                        <ExternalLinkIcon size={14} />
                      </a>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.categories.map((cat: string) => (
                        <span key={cat} className="text-[10px] bg-base-300 px-1.5 py-0.5 rounded text-base-content/70 lowercase">
                          #{cat}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener" className="text-base-content/40 hover:text-primary transition-colors">
                          <GithubIconComponent size={14} />
                        </a>
                      )}
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener" className="text-base-content/40 hover:text-primary transition-colors">
                          <GlobeIconComponent size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Links Sub-section */}
          {links.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-base-content/40 px-1 pt-2">Links</h2>
              {links.map(
                (link: { title: string; url: string }, index: number) => {
                  const favicon = getFaviconUrl(link.url);
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener"
                      className="group flex items-center gap-3 w-full px-5 py-4 rounded-2xl bg-base-200 border border-base-300 hover:border-primary/30 hover:bg-base-200/80 hover:scale-[1.02] transition-all duration-200 focus-ring focus:outline-none"
                    >
                      {favicon && (
                        <img
                          src={favicon}
                          alt=""
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-md shrink-0"
                        />
                      )}
                      <span className="flex-1 text-sm font-medium text-base-content truncate">
                        {link.title}
                      </span>
                      <ExternalLinkIcon
                        size={14}
                        className="text-base-content/40 group-hover:text-primary shrink-0 transition-colors"
                      />
                    </a>
                  );
                }
              )}
            </div>
          )}

          {links.length === 0 && projects.length === 0 && socialUrls.length === 0 && (
            <div className="text-center py-8 text-base-content/40 text-sm">
              No links or projects yet.
            </div>
          )}
        </div>

        {/* Made with deen.page — Floating Attribution */}
        <div className="mt-auto pt-16 pb-4">
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/80 border border-base-300 hover:border-primary/30 transition-all duration-200 text-xs font-medium text-base-content/50 hover:text-base-content/80"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Made with deen.page
          </a>
        </div>
      </div>
    </div>
  );
}
