import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { BuilderBadge } from "@/components/badge";
import {
  ExternalLinkIcon,
  GithubIconComponent,
  GlobeIconComponent,
  ArrowLeftIcon,
  StoreIcon,
  SmartphoneIcon,
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
    <div className="max-w-4xl mx-auto px-4 py-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

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
        <div className="glass-card rounded-3xl p-8 md:p-12 mb-12 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl shrink-0">
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

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-display font-medium mb-4">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat: string) => (
                  <span
                    key={cat}
                    className="text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {CATEGORY_LABELS[cat as Category] || cat}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/5">
                <a
                  href={addRefParam(project.url)}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-primary rounded-full px-8 gap-2 font-medium tracking-wide shadow-lg shadow-primary/20"
                >
                  <ExternalLinkIcon size={16} />
                  Visit Project
                </a>
                <MashallahButton
                  slug={project.slug}
                  initialCount={project.mashallahCount ?? 0}
                />
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-outline border-white/10 hover:border-white/30 hover:bg-white/5 rounded-full px-6 gap-2 font-medium tracking-wide"
                  >
                    <GithubIconComponent size={16} />
                    Source
                  </a>
                )}
                {project.appStoreUrl && (
                  <a
                    href={project.appStoreUrl}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-outline border-white/10 hover:border-white/30 hover:bg-white/5 rounded-full px-6 gap-2 font-medium tracking-wide"
                  >
                    <StoreIcon size={16} />
                    App Store
                  </a>
                )}
                {project.playStoreUrl && (
                  <a
                    href={project.playStoreUrl}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-outline border-white/10 hover:border-white/30 hover:bg-white/5 rounded-full px-6 gap-2 font-medium tracking-wide"
                  >
                    <SmartphoneIcon size={16} />
                    Play Store
                  </a>
                )}
                {project.chromeStoreUrl && (
                  <a
                    href={project.chromeStoreUrl}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-outline border-white/10 hover:border-white/30 hover:bg-white/5 rounded-full px-6 gap-2 font-medium tracking-wide"
                  >
                    <GlobeIconComponent size={16} />
                    Chrome
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <article className="prose prose-invert prose-lg max-w-none prose-p:text-base-content/80 prose-headings:text-base-content prose-strong:text-base-content">
              {project.description
                .split("\n\n")
                .filter(Boolean)
                .map((paragraph: string, index: number) => (
                  <p key={`${project.slug}-description-${index}`}>
                    {paragraph}
                  </p>
                ))}
            </article>
          </div>

          <div className="lg:col-span-1">
            {builder && (
              <div className="glass-card rounded-2xl p-6 border border-white/5">
                <p className="text-xs font-medium tracking-widest uppercase text-primary mb-6">
                  Created By
                </p>
                <Link
                  href={`/${builder.username}`}
                  className="flex flex-col gap-4 group"
                >
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-white/20 to-white/5 group-hover:from-primary/50 group-hover:to-primary/10 transition-colors duration-500">
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
                      <span className="text-lg font-display font-medium group-hover:text-primary transition-colors">
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
