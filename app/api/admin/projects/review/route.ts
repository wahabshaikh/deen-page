import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { getAdminSession } from "@/lib/admin";

// GET: List all projects under review
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const projects = await Project.find({ isPublic: false })
      .sort({ createdAt: -1 })
      .populate("builderId", "name username xHandle avatar")
      .lean();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Admin list review projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects for review" },
      { status: 500 }
    );
  }
}

// PUT: Approve a project (set isPublic to true)
export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { isPublic: true },
      { new: true }
    );

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Admin approve project error:", error);
    return NextResponse.json(
      { error: "Failed to approve project" },
      { status: 500 }
    );
  }
}
