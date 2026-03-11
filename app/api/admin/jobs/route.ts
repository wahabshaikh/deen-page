import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models/job";
import { getAdminSession } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get("status");
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Admin list jobs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
