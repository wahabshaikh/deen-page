import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { ProjectCard } from "@/components/project-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryChips } from "@/components/category-chips";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";
import { FolderOpen } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

async function getProjects(q?: string, category?: string) {
  await connectDB();
  const filter: Record<string, unknown> = {};

  if (q?.trim()) {
    filter.$or = [
      { title: { $regex: q.trim(), $options: "i" } },
      { description: { $regex: q.trim(), $options: "i" } },
    ];
  }

  if (category?.trim()) {
    filter.categories = category.trim();
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("builderId", "name slug xHandle avatar")
      .lean(),
    Project.countDocuments(filter),
  ]);

  return { projects, total };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q;
  const category = params.category;
  const { projects, total } = await getProjects(q, category);

  return (
    <div className="relative min-h-screen pt-24 pb-24">
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-primary/5 via-secondary/5 to-base-100 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="max-w-3xl mx-auto mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-display text-center mb-2 text-balance">Projects</h1>
          <p className="text-center text-base-content/60 mb-8">
            Explore what the community is building.
          </p>
          <div className="card card-border bg-base-200 border-base-300 rounded-box p-2 shadow-xl hover:border-primary/30 transition-colors duration-300 mb-6">
            <Suspense>
              <SearchBar basePath="/projects" placeholder="Search projects…" />
            </Suspense>
          </div>
          <div className="flex justify-center">
            <Suspense>
              <CategoryChips basePath="/projects" />
            </Suspense>
          </div>
        </div>

        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-base-300">
            <p className="text-sm font-medium tracking-widest text-base-content/50 uppercase">
              <span className="text-primary">{total}</span> project{total !== 1 ? "s" : ""}
              {q && (
                <span className="text-base-content/80"> matching &quot;{q}&quot;</span>
              )}
              {category && (
                <span className="text-base-content/80">
                  {" "}
                  · {CATEGORY_LABELS[category as Category] || category}
                </span>
              )}
            </p>
          </div>

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
        </div>
      </div>
    </div>
  );
}
