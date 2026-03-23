import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { BuilderBadge } from "@/components/badge";
import {
  ExternalLinkIcon,
  GlobeIconComponent,
  ArrowLeftIcon,
} from "@/components/icons";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";
import { addRefParam, upgradeTwitterProfileImage } from "@/lib/url";
import type { Metadata } from "next";
import Link from "next/link";
import { MashallahButton } from "@/components/mashallah-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const project = await Project.findOne({ slug })
    .populate("builderId", "name")
    .lean();

  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} | deen.page`,
      description: project.description,
      images: [`/api/og?type=project&slug=${slug}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | deen.page`,
      description: project.description,
      images: [`/api/og?type=project&slug=${slug}`],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  await connectDB();

  const project = await Project.findOne({ slug })
    .populate("builderId", "name username xHandle avatar status")
    .lean();

  if (!project) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder = project.builderId as any;
  const categories = project.categories || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[980px] h-[460px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute -top-10 right-[8%] w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10" />

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase text-base-content/50 hover:text-primary transition-colors mb-12 group"
      >
        <ArrowLeftIcon
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Directory
      </Link>

      <div className="animate-fade-in-up">
        <div className="glass-card rounded-4xl p-6 sm:p-8 md:p-10 mb-10 md:mb-12 border border-white/10 relative overflow-hidden shadow-2xl shadow-black/30">
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-radial from-primary/12 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-start gap-6 md:gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/2 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl shrink-0 ring-1 ring-primary/20">
              {project.favicon ? (
                <img
                  src={project.favicon}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <GlobeIconComponent size={48} className="text-primary/50" />
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-[3.2rem] font-display font-medium mb-4 leading-[1.1] text-balance gradient-text-gold">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat: string) => (
                  <span
                    key={cat}
                    className="text-[11px] font-semibold tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full bg-primary/12 text-primary border border-primary/25"
                  >
                    {CATEGORY_LABELS[cat as Category] || cat}
                  </span>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-5">
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <a
                    href={addRefParam(project.url)}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-primary h-12 min-h-12 rounded-full px-8 gap-2 font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                  >
                    <ExternalLinkIcon size={16} />
                    Visit Project
                  </a>
                  <MashallahButton
                    slug={project.slug}
                    initialCount={project.mashallahCount ?? 0}
                  />
                  {project.appStoreUrl && (
                    <a
                      href={project.appStoreUrl}
                      target="_blank"
                      rel="noopener"
                      className="btn btn-outline h-12 min-h-12 border-white/15 hover:border-primary/50 hover:bg-white/5 rounded-full px-6 font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                    >
                      App Store
                    </a>
                  )}
                  {project.playStoreUrl && (
                    <a
                      href={project.playStoreUrl}
                      target="_blank"
                      rel="noopener"
                      className="btn btn-outline h-12 min-h-12 border-white/15 hover:border-primary/50 hover:bg-white/5 rounded-full px-6 font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                    >
                      Google Play
                    </a>
                  )}
                </div>

                {(project.githubUrl || project.chromeStoreUrl) && (
                  <div className="text-sm text-base-content/60">
                    <span className="mr-2">More links:</span>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener"
                        className="underline decoration-white/30 hover:decoration-primary hover:text-primary transition-colors"
                      >
                        Source
                      </a>
                    )}
                    {project.githubUrl && project.chromeStoreUrl && (
                      <span className="mx-2 text-base-content/40">·</span>
                    )}
                    {project.chromeStoreUrl && (
                      <a
                        href={project.chromeStoreUrl}
                        target="_blank"
                        rel="noopener"
                        className="underline decoration-white/30 hover:decoration-primary hover:text-primary transition-colors"
                      >
                        Chrome Web Store
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2">
            <article className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8 md:p-10 prose prose-invert prose-lg max-w-none prose-p:text-base-content/80 prose-headings:text-base-content prose-strong:text-base-content prose-p:leading-8 prose-p:text-[1.03rem]">
              {project.description
                .split("\n\n")
                .filter(Boolean)
                .map((paragraph: string, index: number) => (
                  <p
                    key={`${project.slug}-description-${index}`}
                    className="tracking-[0.01em] mb-5 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
            </article>
          </div>

          <div className="lg:col-span-1">
            {builder && (
              <div className="glass-card rounded-3xl p-6 border border-white/10 sticky top-24">
                <p className="text-xs font-medium tracking-widest uppercase text-primary/90 mb-6">
                  Created By
                </p>
                <Link
                  href={`/${builder.username}`}
                  className="flex flex-col gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 rounded-2xl"
                >
                  <div className="w-16 h-16 rounded-full p-0.5 bg-linear-to-br from-white/20 to-white/5 group-hover:from-primary/50 group-hover:to-primary/10 transition-colors duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-base-200">
                      {builder.avatar ? (
                        <img
                          src={
                            upgradeTwitterProfileImage(builder.avatar) ??
                            builder.avatar
                          }
                          alt={builder.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-base-100">
                          <span className="text-2xl font-display font-medium text-primary">
                            {builder.name[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-display font-medium group-hover:text-primary transition-colors">
                        {builder.name}
                      </span>
                      <BuilderBadge status={builder.status} />
                    </div>
                    <span className="text-sm font-medium tracking-wide text-base-content/50">
                      @{builder.xHandle}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
