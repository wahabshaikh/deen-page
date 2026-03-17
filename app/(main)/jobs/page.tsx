import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models/job";
import { JobCard } from "@/components/job-card";
import { SearchBar } from "@/components/search-bar";
import { SubmitJobModal } from "@/components/submit-job-modal";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs",
  description:
    "Find job opportunities at Islamic technology companies and Muslim-led startups on deen.page.",
  openGraph: {
    title: "Jobs | deen.page",
    description:
      "Job opportunities at Islamic tech companies and Muslim-led startups.",
    images: [
      {
        url: "/api/og?type=page&page=jobs",
        width: 1200,
        height: 630,
        alt: "Jobs — deen.page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobs | deen.page",
    images: ["/api/og?type=page&page=jobs"],
  },
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

async function getJobs(q?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { status: "approved" };

  if (q?.trim()) {
    filter.$or = [
      { companyName: { $regex: q.trim(), $options: "i" } },
      { companyDescription: { $regex: q.trim(), $options: "i" } },
    ];
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
    Job.countDocuments(filter),
  ]);

  return { jobs, total };
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q;
  const { jobs, total } = await getJobs(q);

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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
            <h1 className="text-4xl font-display text-center sm:text-left text-balance">
              Jobs
            </h1>
            <SubmitJobModal />
          </div>
          <p className="text-center sm:text-left text-base-content/60 mb-8">
            Find opportunities at Islamic tech companies and Muslim-led
            startups.
          </p>
          <div className="card card-border bg-base-200 border-base-300 rounded-box p-2 shadow-xl hover:border-primary/30 transition-colors duration-300 mb-6">
            <Suspense>
              <SearchBar basePath="/jobs" placeholder="Search jobs..." />
            </Suspense>
          </div>
        </div>

        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-base-300">
            <p className="text-sm font-medium tracking-widest text-base-content/50 uppercase">
              <span className="text-primary">{total}</span> job
              {total !== 1 ? "s" : ""}
              {q && (
                <span className="text-base-content/80">
                  {" "}
                  matching &quot;{q}&quot;
                </span>
              )}
            </p>
          </div>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
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
          ) : (
            <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-sm">
              <div className="card-body items-center justify-center py-16">
                <Briefcase
                  size={48}
                  className="text-base-content/30 mb-4"
                  aria-hidden
                />
                <p className="text-base-content/60 text-lg font-light text-center">
                  {q
                    ? "No jobs found. Try adjusting your search."
                    : "No job listings yet. Be the first to submit one!"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
