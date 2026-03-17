import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { Builder } from "@/lib/models/builder";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const builderId = searchParams.get("builderId");
    const featured = searchParams.get("featured");
    const hasGithub = searchParams.get("hasGithub");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = parseInt(searchParams.get("skip") || "0");

    const filter: Record<string, unknown> = { isPublic: true };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      filter.categories = category;
    }

    if (builderId) {
      filter.builderId = builderId;
    }

    if (hasGithub === "true") {
      filter.githubUrl = { $exists: true, $ne: "" };
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("builderId", "name username xHandle avatar")
        .lean(),
      Project.countDocuments(filter),
    ]);

    return NextResponse.json({ projects, total });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
