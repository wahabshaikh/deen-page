import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models/job";
import { z } from "zod";

const jobSubmitSchema = z.object({
  companyName: z.string().min(1),
  companyUrl: z.string().url(),
  companyFavicon: z.string().optional(),
  companyDescription: z.string().optional(),
  listingUrl: z.string().url(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const q = req.nextUrl.searchParams.get("q")?.trim();

    const filter: Record<string, unknown> = { status: "approved" };
    if (q) {
      filter.$or = [
        { companyName: { $regex: q, $options: "i" } },
        { companyDescription: { $regex: q, $options: "i" } },
      ];
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("List jobs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = jobSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const baseSlug = data.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug;
    let counter = 1;
    while (await Job.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const job = await Job.create({
      companyName: data.companyName,
      companyUrl: data.companyUrl,
      companyFavicon: data.companyFavicon || undefined,
      companyDescription: data.companyDescription || undefined,
      listingUrl: data.listingUrl,
      status: "pending",
      slug,
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Submit job error:", error);
    return NextResponse.json(
      { error: "Failed to submit job" },
      { status: 500 }
    );
  }
}
