import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { Builder } from "@/lib/models/builder";
import { Job } from "@/lib/models/job";
import {
  ArrowRightIcon,
  ExternalLinkIcon,
  GlobeIconComponent,
  SparklesIconComponent,
  UserIconComponent,
} from "@/components/icons";
import Link from "next/link";
import Image from "next/image";
import { addRefParam } from "@/lib/url";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";
import { MashallahButton } from "@/components/mashallah-button";
import { ProjectCard } from "@/components/project-card";

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

async function getPublicProjects(limit = 200) {
  await connectDB();
  return Project.find({ isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("builderId", "name username xHandle avatar")
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
  mashallahCount?: number;
  createdAt: Date;
  builderId?: { name?: string; username?: string };
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.28em] uppercase text-primary/80 mb-2">
          {eyebrow}
        </p>
        <h2 className="text-2xl md:text-3xl font-display font-medium text-base-content">
          {title}
        </h2>
        <p className="mt-3 text-base-content/65 leading-relaxed">{body}</p>
      </div>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors"
      >
        Browse all projects
        <ArrowRightIcon size={14} />
      </Link>
    </div>
  );
}

function ProjectGrid({
  projects,
  emptyMsg,
}: {
  projects: SerializedProject[];
  emptyMsg: string;
}) {
  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-base-300 bg-base-200/30 py-16 text-center">
        <SparklesIconComponent size={40} className="text-base-content/30 mx-auto mb-4" aria-hidden />
        <p className="text-base-content/60 font-light">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
          builderUsername={project.builderId?.username}
          mashallahCount={project.mashallahCount ?? 0}
        />
      ))}
    </div>
  );
}

function uniqueById(projects: SerializedProject[]) {
  const seen = new Set<string>();
  return projects.filter((project) => {
    const key = project._id.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function HomePage() {
  const [stats, projects] = await Promise.all([getStats(), getPublicProjects()]);

  const serializedProjects = projects as SerializedProject[];
  const sortedByTrending = [...serializedProjects].sort((a, b) => {
    if ((b.mashallahCount ?? 0) !== (a.mashallahCount ?? 0)) {
      return (b.mashallahCount ?? 0) - (a.mashallahCount ?? 0);
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const sortedByRecent = [...serializedProjects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const featuredProject = sortedByTrending[0] ?? sortedByRecent[0] ?? null;

  const trendingProjects = uniqueById(
    sortedByTrending.filter(
      (project) => project._id.toString() !== featuredProject?._id.toString(),
    ),
  ).slice(0, 6);

  const recentProjects = uniqueById(
    sortedByRecent.filter(
      (project) => project._id.toString() !== featuredProject?._id.toString(),
    ),
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-base-100">
      <section className="relative overflow-hidden px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,180,79,0.12),transparent_38%),radial-gradient(circle_at_20%_20%,rgba(44,103,83,0.18),transparent_28%)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-medium tracking-[0.26em] uppercase text-primary/85 mb-6">
              Connecting the Ummah
            </p>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight leading-[0.95] text-balance">
              Discover what Muslims are building.
            </h1>

            <p className="mt-6 max-w-2xl text-lg md:text-xl font-light leading-relaxed text-base-content/72">
              Explore projects built for the Ummah, support the ones you love,
              and help the best work rise with Mashallah.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/projects"
                className="btn btn-primary btn-lg rounded-full px-8 font-medium shadow-lg shadow-primary/20 focus-ring focus:outline-none gap-2"
              >
                <ArrowRightIcon size={20} />
                Explore projects
              </Link>
              <Link
                href="/signin"
                className="btn btn-outline btn-lg rounded-full px-8 border-base-300 hover:border-primary hover:bg-primary/10 hover:text-primary focus-ring focus:outline-none gap-2"
              >
                <UserIconComponent size={20} />
                Claim your page
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3 md:max-w-xl">
            {[
              { value: stats.projectCount, label: "Projects" },
              { value: stats.builderCount, label: "Builders" },
              { value: stats.jobCount, label: "Jobs" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-base-300 bg-base-200/40 p-4 backdrop-blur-sm"
              >
                <div className="text-2xl md:text-3xl font-display font-medium tabular-nums text-base-content">
                  {item.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-base-content/50">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-24 space-y-20">
        {featuredProject && (
          <section className="relative">
            <SectionHeading
              eyebrow="Featured"
              title="One project worth opening right now"
              body="A single spotlight for the project currently getting the strongest community signal."
            />

            <div className="mt-8 rounded-[2rem] border border-base-300 bg-[linear-gradient(135deg,rgba(214,180,79,0.08),rgba(16,35,30,0.86))] p-8 md:p-10 shadow-2xl shadow-black/25">
              <div>
                <div className="flex flex-wrap gap-2 mb-5">
                    {(featuredProject.categories || []).slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary/90"
                      >
                        {CATEGORY_LABELS[cat as Category] || cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.4rem] border border-base-300 bg-base-100/70 overflow-hidden">
                      {featuredProject.favicon ? (
                        <Image
                          src={featuredProject.favicon}
                          alt=""
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <GlobeIconComponent size={28} className="text-primary/70" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm uppercase tracking-[0.24em] text-base-content/45 mb-2">
                        Featured project
                      </p>
                      <h2 className="text-3xl md:text-4xl font-display font-medium text-balance">
                        {featuredProject.title}
                      </h2>
                      {featuredProject.builderId?.name && (
                        <p className="mt-3 text-base-content/60">
                          by{" "}
                          <Link
                            href={`/${featuredProject.builderId.username}`}
                            className="text-base-content/85 hover:text-primary transition-colors"
                          >
                            {featuredProject.builderId.name}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-6 max-w-2xl text-lg leading-relaxed text-base-content/74">
                    {featuredProject.description}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a
                      href={addRefParam(featuredProject.url)}
                      target="_blank"
                      rel="noopener"
                      className="btn btn-primary rounded-full px-7 font-medium shadow-lg shadow-primary/20"
                    >
                      <ExternalLinkIcon size={16} />
                      Visit project
                    </a>
                    <Link
                      href={`/projects/${featuredProject.slug}`}
                      className="btn btn-outline rounded-full px-7 border-base-300 hover:border-primary hover:bg-primary/10 hover:text-primary"
                    >
                      View details
                    </Link>
                    <MashallahButton
                      slug={featuredProject.slug}
                      initialCount={featuredProject.mashallahCount ?? 0}
                    />
                  </div>
                </div>
              </div>
          </section>
        )}

        <section>
          <SectionHeading
            eyebrow="Trending"
            title="Projects getting the most Mashallah"
            body="Sorted by community appreciation, with newer projects winning ties."
          />
          <div className="mt-8">
            <ProjectGrid
              projects={trendingProjects}
              emptyMsg="No trending projects yet. Give the first few some love."
            />
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Recent"
            title="New arrivals on deen.page"
            body="Fresh projects and launches entering the ecosystem."
          />
          <div className="mt-8">
            <ProjectGrid
              projects={recentProjects}
              emptyMsg="No recent projects yet. Publish the first one."
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-base-300 bg-base-200/35 p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.24em] uppercase text-primary/80 mb-3">
                Build in public
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-balance">
                Share your work. Let the right builders find it.
              </h2>
              <p className="mt-4 max-w-2xl text-base-content/68 leading-relaxed">
                Claim your page, publish your project, and let the community help
                surface great work through simple public appreciation.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/signin"
                className="btn btn-primary rounded-full px-7 font-medium shadow-lg shadow-primary/20 gap-2"
              >
                <UserIconComponent size={18} />
                Claim your page
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
