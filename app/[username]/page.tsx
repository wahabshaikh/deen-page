import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { Project } from "@/lib/models/project";
import { ProjectCard } from "@/components/project-card";
import { BuilderBadge } from "@/components/badge";
import {
  Github,
  Globe,
  Heart,
  Twitter,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { addRefParam, upgradeTwitterProfileImage } from "@/lib/url";
import { getFlagForCountryName } from "@/lib/countries";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  await connectDB();
  const builder = await Builder.findOne({ username }).lean();

  if (!builder) return { title: "Builder Not Found" };

  return {
    title: builder.name,
    description: `${builder.name} (@${builder.xHandle}) — builder on deen.page (Muslim Builders & Islamic Projects). ${builder.stack?.join(", ") || ""}`,
    openGraph: {
      title: `${builder.name} | deen.page`,
      description: `Discover ${builder.name}'s projects on deen.page — Muslim Builders & Islamic Projects.`,
      images: [`/api/og?type=builder&slug=${username}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${builder.name} | deen.page`,
      description: `Discover ${builder.name}'s projects on deen.page — Muslim Builders & Islamic Projects.`,
      images: [`/api/og?type=builder&slug=${username}`],
    },
  };
}

export default async function BuilderProfilePage({ params }: PageProps) {
  const { username } = await params;
  await connectDB();

  const builder = await Builder.findOne({ username }).lean();
  if (!builder) notFound();

  const projects = await Project.find({ builderId: builder._id })
    .sort({ createdAt: -1 })
    .lean();

  const countryFlag = builder.country
    ? getFlagForCountryName(builder.country)
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Profile Header */}
      <div className="glass-card rounded-3xl p-8 md:p-12 mb-16 animate-fade-in-up border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-primary/30 to-transparent group-hover:from-primary/60 transition-colors duration-500">
              <div className="w-full h-full rounded-full overflow-hidden bg-base-200 border-4 border-base-100">
                {builder.avatar ? (
                  <img
                    src={upgradeTwitterProfileImage(builder.avatar) ?? builder.avatar}
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
            <div className="absolute -bottom-2 -right-2 bg-base-100 rounded-full p-1 shadow-xl">
              <BuilderBadge status={builder.status} />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-3">
              {builder.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-base-content/60">
              <a
                href={`https://x.com/${builder.xHandle}`}
                target="_blank"
                rel="noopener"
                className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium tracking-wide"
              >
                <Twitter size={16} />@{builder.xHandle}
              </a>

              {builder.country && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-1.5 font-medium tracking-wide">
                    {countryFlag && (
                      <span className="text-base leading-none" aria-hidden>
                        {countryFlag}
                      </span>
                    )}
                    {builder.country}
                  </div>
                </>
              )}
            </div>

            {/* Stack */}
            {builder.stack && builder.stack.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {builder.stack.map((tech: string) => (
                  <span
                    key={tech}
                    className="text-xs font-medium tracking-widest uppercase px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-base-content/70"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Status tags */}
            {builder.statusTags && builder.statusTags.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                {builder.statusTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {builder.githubUrl && (
                <a
                  href={builder.githubUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-outline border-white/10 hover:border-white/30 hover:bg-white/5 rounded-full px-6 gap-2 font-medium tracking-wide"
                >
                  <Github size={16} />
                  GitHub
                </a>
              )}
              {builder.websiteUrl && (
                <a
                  href={addRefParam(builder.websiteUrl)}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-outline border-white/10 hover:border-white/30 hover:bg-white/5 rounded-full px-6 gap-2 font-medium tracking-wide"
                >
                  <Globe size={16} />
                  Website
                </a>
              )}
              {builder.supportLink && (
                <a
                  href={addRefParam(builder.supportLink)}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-primary rounded-full px-6 gap-2 font-medium tracking-wide shadow-lg shadow-primary/20"
                >
                  <Heart size={16} className="fill-primary-content/20" />
                  Support
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verify Profile CTA for indexed builders */}
      {builder.status === "indexed" && (
        <div className="glass-card border border-warning/30 bg-warning/5 rounded-2xl p-6 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up delay-200">
          <p className="text-warning font-medium">
            Is this your profile? Verify ownership to edit and manage it.
          </p>
          <Link
            href="/dashboard"
            className="btn btn-warning btn-sm rounded-full px-6 text-warning-content"
          >
            Claim Profile
          </Link>
        </div>
      )}

      {/* Projects */}
      <section className="animate-fade-in-up delay-300">
        <div className="flex items-end gap-4 mb-8 border-b border-white/5 pb-4">
          <h2 className="text-3xl font-display">Projects</h2>
          <span className="text-primary font-medium mb-1">
            {projects.length}
          </span>
        </div>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id.toString()}
                title={project.title}
                description={project.description}
                url={project.url}
                categories={project.categories || []}
                slug={project.slug}
                githubUrl={project.githubUrl}
                favicon={project.favicon}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.02]">
            <p className="opacity-50 text-lg font-light">No projects yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
