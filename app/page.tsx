import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { Builder } from "@/lib/models/builder";
import { ProjectCard } from "@/components/project-card";
import { BuilderCard } from "@/components/builder-card";
import { ArrowRight, FolderOpen, Users, Compass } from "lucide-react";
import Link from "next/link";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderProjectGrid(projects: any[], emptyMsg: string) {
  if (projects.length === 0) {
    return (
      <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-sm">
        <div className="card-body items-center justify-center py-16">
          <FolderOpen size={48} className="text-base-content/30 mb-4" aria-hidden />
          <p className="text-base-content/60 text-lg font-light">{emptyMsg}</p>
        </div>
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

export default async function HomePage() {
  const [stats, recentProjects, recentBuilders, cofounderBuilders] =
    await Promise.all([
      getStats(),
      getRecentProjects(),
      getRecentBuilders(),
      getCofounderBuilders(),
    ]);

  return (
    <div className="relative min-h-screen">
      {/* Background elements — standard Tailwind only */}
      <div className="absolute top-0 inset-x-0 h-screen bg-gradient-to-b from-primary/5 via-secondary/10 to-base-100 pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-5 w-2/5 h-1/2 rounded-full bg-primary/5 blur-3xl pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-20 -left-5 w-1/3 h-40 rounded-full bg-secondary/10 blur-3xl pointer-events-none -z-10 animate-float delay-500" />

      {/* Hero — viewport minus navbar (min-h-hero from globals) */}
      <section className="relative overflow-hidden px-4 flex flex-col items-center justify-center min-h-hero">
        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-base-300 bg-base-200/80 backdrop-blur-sm mb-8 animate-fade-in-up text-sm font-medium tracking-widest uppercase text-base-content/80">
            <span className="size-2 rounded-full bg-primary animate-pulse" aria-hidden />
            Connecting the Ummah
          </div>

          <div className="animate-reveal overflow-hidden relative">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium tracking-tight mb-6 leading-tight text-balance">
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

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join"
              className="btn btn-primary btn-lg rounded-full px-10 gap-3 font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 group transition-[transform,box-shadow] duration-300 focus-ring focus:outline-none touch-manipulation"
            >
              Join the Directory
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/browse"
              className="btn btn-outline border-white/10 hover:border-primary hover:bg-primary/10 hover:text-primary btn-lg rounded-full px-10 gap-3 font-medium tracking-wide transition-[border-color,background-color,color] duration-300 group focus-ring focus:outline-none touch-manipulation"
            >
              <Compass size={18} />
              Browse Directory
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 animate-fade-in-up delay-400 border-t border-base-300 pt-10 w-full max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-2 group">
              <span className="text-4xl md:text-5xl font-display font-medium group-hover:text-primary transition-colors tabular-nums">
                {stats.builderCount}
              </span>
              <span className="text-xs uppercase tracking-widest text-base-content/75 group-hover:text-base-content transition-colors">
                Builders
              </span>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-base-300 to-transparent" />
            <div className="flex flex-col items-center gap-2 group">
              <span className="text-4xl md:text-5xl font-display font-medium group-hover:text-primary transition-colors tabular-nums">
                {stats.projectCount}
              </span>
              <span className="text-xs uppercase tracking-widest text-base-content/75 group-hover:text-base-content transition-colors">
                Projects
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-24 space-y-24">
        {/* Projects */}
        <section
          id="projects"
          className="animate-fade-in-up delay-200 relative scroll-mt-24"
        >
          <div className="border-accent-top pt-8 mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-2">
                Showcase
              </p>
              <h2 className="text-4xl font-display text-balance">Featured Projects</h2>
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
            <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-sm">
              <div className="card-body items-center justify-center py-16">
                <FolderOpen size={48} className="text-base-content/30 mb-4" aria-hidden />
                <p className="text-base-content/60 text-lg font-light">No projects yet.</p>
              </div>
            </div>
          )}
        </section>

        {/* Builders */}
        <section id="builders" className="animate-fade-in-up relative scroll-mt-24">
          <div className="border-accent-top pt-8 mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-2">
                Talent
              </p>
              <h2 className="text-4xl font-display text-balance">Recent Builders</h2>
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
            <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-sm">
              <div className="card-body items-center justify-center py-16">
                <Users size={48} className="text-base-content/30 mb-4" aria-hidden />
                <p className="text-base-content/60 text-lg font-light">No builders yet.</p>
              </div>
            </div>
          )}
        </section>

        {/* Looking for Co-founder */}
        {cofounderBuilders.length > 0 && (
          <section id="cofounders" className="animate-fade-in-up relative scroll-mt-24">
            <div className="border-accent-top pt-8 mb-8">
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-2">
                Collaborate
              </p>
              <h2 className="text-4xl font-display text-balance">Looking for Co-founder</h2>
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl pointer-events-none -z-10" />
          <div className="card card-border glass-card bg-base-200 border-base-300 rounded-box p-8 md:p-16 max-w-4xl mx-auto shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <h2 className="text-4xl md:text-5xl font-display font-medium mb-6 leading-tight relative z-10 text-balance">
              Building for the{" "}
              <span className="gradient-text-gold italic">Ummah?</span>
            </h2>
            <p className="text-lg md:text-xl font-light text-base-content/90 mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
              Join the directory. Get discovered by peers, find co-founders, and
              showcase your impact.
            </p>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/join"
                className="btn btn-primary btn-lg rounded-full px-10 gap-3 font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 group/btn transition-[transform,box-shadow] duration-300 focus-ring focus:outline-none touch-manipulation"
              >
                Join the Directory
                <ArrowRight
                  size={18}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/browse"
                className="btn btn-outline border-white/10 hover:border-primary hover:bg-primary/10 hover:text-primary btn-lg rounded-full px-10 gap-3 font-medium tracking-wide transition-[border-color,background-color,color] duration-300 focus-ring focus:outline-none touch-manipulation"
              >
                <Compass size={18} />
                Browse Directory
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
