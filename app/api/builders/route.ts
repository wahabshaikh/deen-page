import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const statusTag = searchParams.get("statusTag");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = parseInt(searchParams.get("skip") || "0");

    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { xHandle: { $regex: q, $options: "i" } },
      ];
    }

    if (statusTag) {
      filter.statusTags = statusTag;
    }

    const [builders, total] = await Promise.all([
      Builder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Builder.countDocuments(filter),
    ]);

    return NextResponse.json({ builders, total });
  } catch (error) {
    console.error("Error fetching builders:", error);
    return NextResponse.json(
      { error: "Failed to fetch builders" },
      { status: 500 }
    );
  }
}
