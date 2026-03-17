import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { Builder } from "@/lib/models/builder";
import { Job } from "@/lib/models/job";
import { BuilderCard } from "@/components/builder-card";
import { JobCard } from "@/components/job-card";
import {
  ArrowRight,
  Compass,
  FolderOpen,
  Users,
  Briefcase,
  ExternalLink,
  Globe,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { addRefParam } from "@/lib/url";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectDB();
  const [builderCount, projectCount, jobCount] = await Promise.all([
    Builder.countDocuments(),
    Project.countDocuments({ isPublic: true }),
    Job.countDocuments({ status: "approved" }),
  ]);
  return { builderCount, projectCount, jobCount };
}

async function getRecentProjects(limit = 6) {
  await connectDB();
  return Project.find({ isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("builderId", "name username xHandle avatar")
    .lean();
}

async function getRecentBuilders(limit = 6) {
  await connectDB();
  return Builder.find().sort({ createdAt: -1 }).limit(limit).lean();
}

async function getRecentJobs(limit = 3) {
  await connectDB();
  return Job.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

interface SerializedProject {
  _id: { toString(): string };
  title: string;
  description: string;
  url: string;
  categories?: string[];
  slug: string;
  githubUrl?: string;
  favicon?: string;
  builderId?: { name?: string; username?: string };
}

function BrowseCard({
  href,
  label,
  count,
  icon: Icon,
  accent,
}: {
  href: string;
  label: string;
  count: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 p-5 rounded-xl border border-base-300 bg-base-200/50 hover:border-base-content/20 hover:bg-base-200 transition-all duration-200 focus-ring focus:outline-none ${accent}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-base-300/80 text-base-content/70 group-hover:text-primary transition-colors">
          <Icon size={20} strokeWidth={1.5} />
        </div>
        <span className="font-medium text-base-content/90">{label}</span>
      </div>
      <span className="text-2xl font-display font-medium tabular-nums text-base-content">
        {count}
      </span>
      <span className="text-xs uppercase tracking-widest text-base-content/60 group-hover:text-base-content/80 transition-colors">
        View all →
      </span>
    </Link>
  );
}

function ProjectTableRow({ project }: { project: SerializedProject }) {
  const categories = project.categories || [];
  return (
    <tr className="group border-b border-base-300/80 last:border-0 hover:bg-base-200/50 transition-colors">
      <td className="py-4 pr-4">
        <Link
          href={`/projects/${project.slug}`}
          className="flex items-center gap-3 focus-ring rounded focus:outline-none"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-base-300 shrink-0 overflow-hidden">
            {project.favicon ? (
              <Image
                src={project.favicon}
                alt=""
                width={36}
                height={36}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <Globe size={16} className="text-base-content/50" />
            )}
          </div>
          <span className="font-medium text-base-content group-hover:text-primary transition-colors">
            {project.title}
          </span>
        </Link>
      </td>
      <td className="py-4 px-4 text-sm text-base-content/60">
        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className="px-2 py-0.5 rounded bg-base-300/80 text-xs uppercase tracking-wider"
            >
              {CATEGORY_LABELS[cat as Category] || cat}
            </span>
          ))}
          {categories.length > 2 && (
            <span className="text-base-content/50">+{categories.length - 2}</span>
          )}
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-base-content/70">
        {project.builderId?.name ? (
          <Link
            href={`/${project.builderId.username}`}
            className="hover:text-primary transition-colors"
          >
            {project.builderId.name}
          </Link>
        ) : (
          <span className="text-base-content/50">—</span>
        )}
      </td>
      <td className="py-4 pl-4 text-right">
        <a
          href={addRefParam(project.url)}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-primary transition-colors focus-ring rounded focus:outline-none"
          aria-label={`Visit ${project.title}`}
        >
          <ExternalLink size={14} />
        </a>
      </td>
    </tr>
  );
}

function renderProjectTable(projects: SerializedProject[], emptyMsg: string) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-200/30 py-16 text-center">
        <FolderOpen
          size={40}
          className="text-base-content/30 mx-auto mb-4"
          aria-hidden
        />
        <p className="text-base-content/60 font-light">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-base-300 bg-base-200/30 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs uppercase tracking-widest text-base-content/60 border-b border-base-300">
            <th className="py-3 pr-4 font-medium">Project</th>
            <th className="py-3 px-4 font-medium">Categories</th>
            <th className="py-3 px-4 font-medium">Builder</th>
            <th className="py-3 pl-4 font-medium text-right">Link</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectTableRow key={project._id.toString()} project={project} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function HomePage() {
  const [stats, recentProjects, recentBuilders, recentJobs] = await Promise.all(
    [getStats(), getRecentProjects(), getRecentBuilders(), getRecentJobs()],
  );

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero */}
      <section className="relative px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-base-content mb-4 leading-tight">
            The Directory of
            <br />
            <span className="gradient-text-gold italic">Muslim Builders</span>
            <br />
            <span className="gradient-text-gold italic">& Islamic Projects</span>
          </h1>
          <p className="text-base md:text-lg text-base-content/70 mb-10 max-w-xl mx-auto font-light">
            Discover developers, founders, and indie hackers building for the
            Ummah.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signin"
              className="inline-flex items-center h-12 px-8 rounded-lg bg-primary text-primary-content font-medium hover:opacity-90 transition-opacity focus-ring focus:outline-none"
            >
              Join the Directory
            </Link>
            <a
              href="#browse"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-lg border border-base-300 bg-transparent text-base-content font-medium hover:bg-base-200 hover:border-base-content/20 transition-colors focus-ring focus:outline-none"
            >
              <Compass size={18} />
              Browse
            </a>
          </div>

          {/* Stats — minimal */}
          <div className="flex justify-center gap-10 mt-16 pt-10 border-t border-base-300">
            <div className="text-center">
              <span className="block text-2xl md:text-3xl font-display font-medium tabular-nums text-base-content">
                {stats.projectCount}
              </span>
              <span className="text-xs uppercase tracking-widest text-base-content/60">
                Projects
              </span>
            </div>
            <div className="text-center">
              <span className="block text-2xl md:text-3xl font-display font-medium tabular-nums text-base-content">
                {stats.builderCount}
              </span>
              <span className="text-xs uppercase tracking-widest text-base-content/60">
                Builders
              </span>
            </div>
            <div className="text-center">
              <span className="block text-2xl md:text-3xl font-display font-medium tabular-nums text-base-content">
                {stats.jobCount}
              </span>
              <span className="text-xs uppercase tracking-widest text-base-content/60">
                Jobs
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-24 space-y-20">
        {/* Browse by — card grid */}
        <section id="browse" className="scroll-mt-24">
          <h2 className="text-sm font-medium uppercase tracking-widest text-base-content/60 mb-4">
            Browse by
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BrowseCard
              href="/projects"
              label="Projects"
              count={stats.projectCount}
              icon={FolderOpen}
              accent="hover:border-primary/20"
            />
            <BrowseCard
              href="/builders"
              label="Builders"
              count={stats.builderCount}
              icon={Users}
              accent="hover:border-secondary/30"
            />
            <BrowseCard
              href="/jobs"
              label="Jobs"
              count={stats.jobCount}
              icon={Briefcase}
              accent="hover:border-accent/30"
            />
          </div>
        </section>

        {/* Recent projects */}
        <section id="projects" className="scroll-mt-24">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-1">
                Showcase
              </p>
              <h2 className="text-xl font-display font-medium text-base-content">
                Recent projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-sm text-base-content/60 hover:text-primary transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          {renderProjectTable(recentProjects, "No projects yet.")}
        </section>

        {/* Builders */}
        <section id="builders" className="scroll-mt-24">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-1">
                Talent
              </p>
              <h2 className="text-xl font-display font-medium text-base-content">
                Recent builders
              </h2>
            </div>
            <Link
              href="/builders"
              className="text-sm text-base-content/60 hover:text-primary transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          {recentBuilders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBuilders.map((builder) => (
                <BuilderCard
                  key={builder._id.toString()}
                  name={builder.name}
                  xHandle={builder.xHandle}
                  avatar={builder.avatar}
                  country={builder.country}
                  statusTags={builder.statusTags || []}
                  username={builder.username}
                  status={builder.status}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-base-300 bg-base-200/30 py-16 text-center">
              <Users
                size={40}
                className="text-base-content/30 mx-auto mb-4"
                aria-hidden
              />
              <p className="text-base-content/60 font-light">No builders yet.</p>
            </div>
          )}
        </section>

        {/* Jobs */}
        {recentJobs.length > 0 && (
          <section id="jobs" className="scroll-mt-24">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-sm font-medium tracking-widest text-primary uppercase mb-1">
                  Opportunities
                </p>
                <h2 className="text-xl font-display font-medium text-base-content">
                  Recent job listings
                </h2>
              </div>
              <Link
                href="/jobs"
                className="text-sm text-base-content/60 hover:text-primary transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentJobs.map((job) => (
                <JobCard
                  key={job._id.toString()}
                  companyName={job.companyName}
                  companyUrl={job.companyUrl}
                  companyFavicon={job.companyFavicon}
                  companyDescription={job.companyDescription}
                  listingUrl={job.listingUrl}
                />
              ))}
            </div>
          </section>
        )}

        {/* CTA — Building for the Ummah? */}
        <section className="text-center py-16 relative">
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-transparent to-primary/10 blur-3xl pointer-events-none -z-10" />
          <div className="card card-border glass-card bg-base-200 border-base-300 rounded-box p-8 md:p-16 max-w-4xl mx-auto shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-3xl md:text-4xl font-display font-medium mb-6 leading-tight relative z-10 text-balance">
              Building for the{" "}
              <span className="gradient-text-gold italic">Ummah?</span>
            </h2>
            <p className="text-lg font-light text-base-content/90 mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
              Join the directory. Get discovered by peers, find co-founders, and
              showcase your impact.
            </p>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signin"
                className="btn btn-primary btn-lg rounded-lg px-8 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-[box-shadow] duration-300 focus-ring focus:outline-none"
              >
                Join the Directory
              </Link>
              <a
                href="#browse"
                className="btn btn-outline border-base-300 hover:border-primary hover:bg-primary/10 hover:text-primary btn-lg rounded-lg px-8 font-medium gap-2 transition-colors focus-ring focus:outline-none"
              >
                <Compass size={18} />
                Browse
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
