import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { ProjectCard } from "@/components/project-card";
import { CATEGORY_LABELS, CATEGORIES, type Category } from "@/lib/constants";
import { ArrowLeft, FolderOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABELS[category as Category] || category;

  return {
    title: `${label} Projects`,
    description: `Discover ${label.toLowerCase()} projects on deen.page — Muslim Builders & Islamic Projects.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  // Validate category
  if (!CATEGORIES.includes(category as Category)) {
    notFound();
  }

  await connectDB();

  const projects = await Project.find({ categories: category })
    .sort({ createdAt: -1 })
    .populate("builderId", "name slug xHandle avatar")
    .lean();

  const label = CATEGORY_LABELS[category as Category];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 relative">
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase text-base-content/50 hover:text-primary transition-colors mb-12 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Directory
      </Link>

      <div className="animate-fade-in-up">
        <div className="border-accent-top pt-8 mb-10">
          <h1 className="text-5xl font-display mb-4">{label}</h1>
          <p className="text-xl font-light opacity-60">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Category navigation */}
        <div className="flex flex-wrap gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat}`}
              className={`px-5 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 border ${
                cat === category
                  ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]"
                  : "bg-white/[0.02] border-white/5 text-base-content/60 hover:bg-white/5 hover:text-base-content hover:border-white/10"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
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
                builderName={(project.builderId as any)?.name}
                builderSlug={(project.builderId as any)?.slug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-white/5 rounded-3xl bg-white/[0.02]">
            <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-light opacity-60 mb-2">No projects in this category yet.</p>
            <p className="text-base font-light opacity-40">Be the first to add one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
