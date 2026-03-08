import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { Builder } from "@/lib/models/builder";
import { ProjectCard } from "@/components/project-card";
import { BuilderCard } from "@/components/builder-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryChips } from "@/components/category-chips";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";
import { FolderOpen, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse",
  description:
    "Browse Muslim builders and Islamic projects on deen.page — the curated directory for the Ummah.",
  openGraph: {
    title: "Browse | deen.page",
    description: "Browse projects and builders from the Ummah.",
    images: [{ url: "/api/og?type=page&page=browse", width: 1200, height: 630, alt: "Browse — deen.page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse | deen.page",
    images: ["/api/og?type=page&page=browse"],
  },
};

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

async function getBrowseData(q?: string, category?: string) {
  await connectDB();

  const projectFilter: Record<string, unknown> = {};
  const builderFilter: Record<string, unknown> = {};

  if (q?.trim()) {
    projectFilter.$or = [
      { title: { $regex: q.trim(), $options: "i" } },
      { description: { $regex: q.trim(), $options: "i" } },
    ];
    builderFilter.$or = [
      { name: { $regex: q.trim(), $options: "i" } },
      { xHandle: { $regex: q.trim(), $options: "i" } },
    ];
  }

  if (category?.trim()) {
    projectFilter.categories = category.trim();
  }

  const [projects, builders, projectCount, builderCount] = await Promise.all([
    Project.find(projectFilter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("builderId", "name slug xHandle avatar")
      .lean(),
    q?.trim()
      ? Builder.find(builderFilter).sort({ createdAt: -1 }).limit(100).lean()
      : Builder.find().sort({ createdAt: -1 }).limit(100).lean(),
    Project.countDocuments(projectFilter),
    q?.trim()
      ? Builder.countDocuments(builderFilter)
      : Builder.countDocuments(),
  ]);

  return { projects, builders, projectCount, builderCount };
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q;
  const category = params.category;
  const { projects, builders, projectCount, builderCount } =
    await getBrowseData(q, category);

  return (
    <div className="relative min-h-screen pt-24 pb-24">
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-primary/5 via-secondary/5 to-base-100 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-display text-center mb-2 text-balance">
            Browse Directory
          </h1>
          <p className="text-center text-base-content/60 mb-8">
            Explore Muslim builders and Islamic technology projects.
          </p>
          <div className="card card-border bg-base-200 border-base-300 rounded-box p-2 shadow-xl hover:border-primary/30 transition-colors duration-300 mb-6">
            <Suspense>
              <SearchBar
                basePath="/browse"
                placeholder="Search projects and builders…"
              />
            </Suspense>
          </div>
          <div className="flex justify-center">
            <Suspense>
              <CategoryChips basePath="/browse" />
            </Suspense>
          </div>
        </div>

        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-base-300">
            <p className="text-sm font-medium tracking-widest text-base-content/50 uppercase">
              <span className="text-primary">
                {projectCount + builderCount}
              </span>{" "}
              results
              {q && (
                <span className="text-base-content/80">
                  {" "}
                  matching &quot;{q}&quot;
                </span>
              )}
              {category && (
                <span className="text-base-content/80">
                  {" "}
                  in {CATEGORY_LABELS[category as Category] || category}
                </span>
              )}
            </p>
          </div>

          {/* Builders Section */}
          {builders.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-display mb-6">
                Builders
                <span className="text-base-content/40 text-lg ml-2">
                  ({builderCount})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {builders.map((builder) => (
                  <BuilderCard
                    key={builder._id.toString()}
                    name={builder.name}
                    xHandle={builder.xHandle}
                    avatar={builder.avatar}
                    country={builder.country}
                    stack={builder.stack || []}
                    statusTags={builder.statusTags || []}
                    slug={builder.slug}
                    status={builder.status}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Projects Section */}
          <section>
            <h2 className="text-2xl font-display mb-6">
              Projects
              <span className="text-base-content/40 text-lg ml-2">
                ({projectCount})
              </span>
            </h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    builderName={project.builderId?.name}
                    builderSlug={project.builderId?.slug}
                  />
                ))}
              </div>
            ) : (
              <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-sm">
                <div className="card-body items-center justify-center py-16">
                  <FolderOpen size={48} className="text-base-content/30 mb-4" aria-hidden />
                  <p className="text-base-content/60 text-lg font-light text-center">
                    No projects found. Try adjusting your search or filter.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Empty state for both */}
          {builders.length === 0 && projects.length === 0 && (
            <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-sm">
              <div className="card-body items-center justify-center py-16">
                <Users size={48} className="text-base-content/30 mb-4" aria-hidden />
                <p className="text-base-content/60 text-lg font-light text-center">
                  No results found. Try adjusting your search or filter.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
