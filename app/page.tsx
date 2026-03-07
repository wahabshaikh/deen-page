import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { Builder } from "@/lib/models/builder";
import { ProjectCard } from "@/components/project-card";
import { BuilderCard } from "@/components/builder-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryChips } from "@/components/category-chips";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";
import { ArrowRight, FolderOpen, Users } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

async function getStats() {
  await connectDB();
  const [builderCount, projectCount] = await Promise.all([
    Builder.countDocuments(),
    Project.countDocuments(),
  ]);
  return { builderCount, projectCount };
}

async function getRecentProjects(limit = 6) {
  await connectDB();
  return Project.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("builderId", "name slug xHandle avatar")
    .lean();
}

async function getCofounderBuilders(limit = 6) {
  await connectDB();
  return Builder.find({ statusTags: "Looking for Co-founder" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

async function getRecentBuilders(limit = 6) {
  await connectDB();
  return Builder.find().sort({ createdAt: -1 }).limit(limit).lean();
}

async function searchResults(q: string, category?: string) {
  await connectDB();

  const projectFilter: Record<string, unknown> = {};
  const builderFilter: Record<string, unknown> = {};

  if (q) {
    projectFilter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
    builderFilter.$or = [
      { name: { $regex: q, $options: "i" } },
      { xHandle: { $regex: q, $options: "i" } },
    ];
  }

  if (category) {
    projectFilter.categories = category;
  }

  const [projects, builders] = await Promise.all([
    Project.find(projectFilter)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("builderId", "name slug xHandle avatar")
      .lean(),
    q
      ? Builder.find(builderFilter).sort({ createdAt: -1 }).limit(10).lean()
      : Promise.resolve([]),
  ]);

  return { projects, builders };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderProjectGrid(projects: any[], emptyMsg: string) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.02]">
        <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
        <p className="opacity-50 text-lg font-light">{emptyMsg}</p>
      </div>
    );
  }

  return (
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
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q;
  const category = params.category;
  const isSearching = !!(q || category);

  if (isSearching) {
    const { projects, builders } = await searchResults(q || "", category);

    return (
      <div className="relative min-h-screen pt-24 pb-32">
        <div className="absolute top-0 inset-x-0 h-[50vh] bg-gradient-to-b from-primary/5 via-secondary/5 to-base-100 pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <h1 className="text-4xl font-display text-center mb-8">
              Search Directory
            </h1>
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 p-2 rounded-2xl shadow-2xl hover:border-white/20 transition-all mb-8">
              <Suspense>
                <SearchBar />
              </Suspense>
            </div>
            <div className="flex justify-center">
              <Suspense>
                <CategoryChips />
              </Suspense>
            </div>
          </div>

          <div className="animate-fade-in-up delay-200">
            <div className="flex items-center gap-4 mb-10 pb-4 border-b border-white/5">
              <p className="text-sm font-medium tracking-widest text-base-content/50 uppercase">
                Found{" "}
                <span className="text-primary">
                  {projects.length + builders.length}
                </span>{" "}
                results
                {q && (
                  <span className="text-base-content/80">
                    {" "}
                    for &quot;{q}&quot;
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

            {builders.length > 0 && (
              <section className="mb-20">
                <h2 className="text-2xl font-display mb-6">Builders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {builders.map((builder) => (
                    <BuilderCard
                      key={builder._id.toString()}
                      name={builder.name}
                      xHandle={builder.xHandle}
                      avatar={builder.avatar}
                      country={builder.country}
                      stack={builder.stack}
                      statusTags={builder.statusTags}
                      slug={builder.slug}
                      status={builder.status}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-display mb-6">Projects</h2>
              {renderProjectGrid(
                projects,
                "No projects found matching your search",
              )}
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Homepage (no search)
  const [stats, recentProjects, recentBuilders, cofounderBuilders] =
    await Promise.all([
      getStats(),
      getRecentProjects(),
      getRecentBuilders(),
      getCofounderBuilders(),
    ]);

  return (
    <div className="relative min-h-screen">
      {/* Background elements */}
      <div className="absolute top-0 inset-x-0 h-[80vh] bg-gradient-to-b from-primary/5 via-secondary/10 to-base-100 pointer-events-none -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50vh] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[40vh] rounded-full bg-secondary/10 blur-[100px] pointer-events-none -z-10 animate-float delay-500" />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32 px-4 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 animate-fade-in-up text-sm font-medium tracking-widest uppercase text-base-content/80">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Connecting the Ummah
          </div>

          <div className="animate-reveal overflow-hidden relative">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium tracking-tight mb-6 leading-[1.1]">
              The Directory of <br className="hidden md:block" />
              <span className="gradient-text-gold italic pr-2">
                Muslim Builders & Islamic Projects
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-2xl font-light text-base-content/90 max-w-2xl mx-auto mb-12 animate-fade-in-up delay-200 leading-relaxed">
            Discover developers, founders, and indie hackers behind islamic
            technology.
          </p>

          <div className="animate-fade-in-up delay-300 w-full max-w-xl mx-auto backdrop-blur-xl bg-white/[0.02] border border-white/10 p-2 rounded-2xl shadow-2xl hover:border-white/20 transition-all">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 animate-fade-in-up delay-400 border-t border-white/5 pt-10 w-full max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-2 group">
              <span className="text-4xl md:text-5xl font-display font-medium group-hover:text-primary transition-colors">
                {stats.builderCount}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-base-content/75 group-hover:text-base-content transition-colors">
                Builders
              </span>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="flex flex-col items-center gap-2 group">
              <span className="text-4xl md:text-5xl font-display font-medium group-hover:text-primary transition-colors">
                {stats.projectCount}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-base-content/75 group-hover:text-base-content transition-colors">
                Projects
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-24 space-y-32">
        {/* Projects */}
        <section
          id="projects"
          className="animate-fade-in-up delay-200 relative"
        >
          <div className="border-accent-top pt-8 mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-2">
                Showcase
              </p>
              <h2 className="text-4xl font-display">Featured Projects</h2>
            </div>
            <Link
              href="/projects"
              className="group flex items-center gap-2 text-sm uppercase tracking-widest hover:text-primary transition-colors text-base-content/80"
            >
              View all projects{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            renderProjectGrid(recentProjects, "")
          ) : (
            <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.02]">
              <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p className="opacity-50 text-lg font-light">No projects yet.</p>
            </div>
          )}
        </section>

        {/* Builders */}
        <section id="builders" className="animate-fade-in-up relative">
          <div className="border-accent-top pt-8 mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-2">
                Talent
              </p>
              <h2 className="text-4xl font-display">Recent Builders</h2>
            </div>
            <Link
              href="/builders"
              className="group flex items-center gap-2 text-sm uppercase tracking-widest hover:text-primary transition-colors text-base-content/80"
            >
              View all builders{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
          {recentBuilders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBuilders.map((builder) => (
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
          ) : (
            <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.02]">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p className="opacity-50 text-lg font-light">No builders yet.</p>
            </div>
          )}
        </section>

        {/* Looking for Co-founder */}
        {cofounderBuilders.length > 0 && (
          <section id="cofounders" className="animate-fade-in-up relative">
            <div className="border-accent-top pt-8 mb-10">
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-2">
                Collaborate
              </p>
              <h2 className="text-4xl font-display">Looking for Co-founder</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cofounderBuilders.map((builder) => (
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

        {/* CTA */}
        <section className="text-center py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-[100px] pointer-events-none -z-10" />
          <div className="glass-card rounded-3xl p-12 md:p-20 max-w-4xl mx-auto border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <h2 className="text-4xl md:text-5xl font-display font-medium mb-6 leading-tight relative z-10">
              Building for the{" "}
              <span className="gradient-text-gold italic">Ummah?</span>
            </h2>
            <p className="text-lg md:text-xl font-light text-base-content/90 mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
              Join the directory. Get discovered by peers, find co-founders, and
              showcase your impact.
            </p>
            <Link
              href="/join"
              className="btn btn-primary btn-lg rounded-full px-10 gap-3 font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 relative z-10 group-hover:scale-105 transition-transform duration-300"
            >
              Request an Invite
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
