import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { BuilderCard } from "@/components/builder-card";
import { SearchBar } from "@/components/search-bar";
import { StatusTagChips } from "@/components/status-tag-chips";
import { Users } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string; statusTag?: string }>;
}

async function getBuilders(q?: string, statusTag?: string) {
  await connectDB();
  const filter: Record<string, unknown> = {};

  if (q?.trim()) {
    filter.$or = [
      { name: { $regex: q.trim(), $options: "i" } },
      { xHandle: { $regex: q.trim(), $options: "i" } },
    ];
  }

  if (statusTag?.trim()) {
    filter.statusTags = statusTag.trim();
  }

  const [builders, total] = await Promise.all([
    Builder.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
    Builder.countDocuments(filter),
  ]);

  return { builders, total };
}

export default async function BuildersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q;
  const statusTag = params.statusTag;
  const { builders, total } = await getBuilders(q, statusTag);

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
          <h1 className="text-4xl font-display text-center mb-2 text-balance">Builders</h1>
          <p className="text-center text-base-content/60 mb-8">
            Discover developers, founders, and indie hackers in the directory.
          </p>
          <div className="card card-border bg-base-200 border-base-300 rounded-box p-2 shadow-xl hover:border-primary/30 transition-colors duration-300 mb-6">
            <Suspense>
              <SearchBar basePath="/builders" placeholder="Search by name or X handle…" />
            </Suspense>
          </div>
          <div className="flex justify-center">
            <Suspense>
              <StatusTagChips basePath="/builders" />
            </Suspense>
          </div>
        </div>

        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-base-300">
            <p className="text-sm font-medium tracking-widest text-base-content/50 uppercase">
              <span className="text-primary">{total}</span> builder{total !== 1 ? "s" : ""}
              {q && (
                <span className="text-base-content/80"> matching &quot;{q}&quot;</span>
              )}
              {statusTag && (
                <span className="text-base-content/80"> · {statusTag}</span>
              )}
            </p>
          </div>

          {builders.length > 0 ? (
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
          ) : (
            <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-sm">
              <div className="card-body items-center justify-center py-16">
                <Users size={48} className="text-base-content/30 mb-4" aria-hidden />
                <p className="text-base-content/60 text-lg font-light text-center">
                  No builders found. Try adjusting your search or filter.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
