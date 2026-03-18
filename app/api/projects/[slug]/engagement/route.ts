import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Project } from "@/lib/models/project";
import { ProjectMashallah } from "@/lib/models/project-mashallah";

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function serializeCounts(project: {
  mashallahCount?: number | null;
}) {
  return {
    mashallahCount: project.mashallahCount ?? 0,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { slug } = await params;
    const project = await Project.findOne({ slug }).select("_id mashallahCount").lean();
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const existing = await ProjectMashallah.findOne({
      projectId: project._id,
      visitorId: session.user.id,
    }).lean();

    return NextResponse.json({
      reacted: !!existing,
      ...serializeCounts(project),
    });
  } catch (error) {
    console.error("Engagement check error:", error);
    return NextResponse.json(
      { error: "Failed to check engagement." },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json(
        { error: "Sign in to say Mashallah." },
        { status: 401 },
      );
    }

    await connectDB();

    const { slug } = await params;
    const project = await Project.findOne({ slug }).select("_id mashallahCount");

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    if (body?.type !== "mashallah") {
      return NextResponse.json(
        { error: "Invalid reaction type." },
        { status: 400 },
      );
    }

    const action = body?.action === "remove" ? "remove" : "add";
    const now = new Date();
    const userId = session.user.id;

    if (action === "remove") {
      const deleted = await ProjectMashallah.findOneAndDelete({
        projectId: project._id,
        visitorId: userId,
      });
      if (!deleted) {
        const current = await Project.findById(project._id).select("mashallahCount").lean();
        return NextResponse.json({
          reacted: false,
          counts: serializeCounts(current ?? project),
        });
      }
      const updated = await Project.findOneAndUpdate(
        { _id: project._id, mashallahCount: { $gt: 0 } },
        { $inc: { mashallahCount: -1 } },
        { new: true },
      ).select("mashallahCount").lean();
      return NextResponse.json({
        reacted: false,
        counts: serializeCounts(updated ?? project),
      });
    }

    try {
      await ProjectMashallah.create({
        projectId: project._id,
        visitorId: userId,
      });

      const updated = await Project.findByIdAndUpdate(
        project._id,
        {
          $inc: { mashallahCount: 1 },
          $set: {
            lastMashallahAt: now,
          },
        },
        { new: true },
      ).select("mashallahCount").lean();

      return NextResponse.json({
        reacted: true,
        created: true,
        counts: serializeCounts(updated ?? project),
      });
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      const current = await Project.findById(project._id).select("mashallahCount").lean();

      return NextResponse.json({
        reacted: true,
        created: false,
        counts: serializeCounts(current ?? project),
      });
    }
  } catch (error) {
    console.error("Mashallah reaction error:", error);
    return NextResponse.json(
      { error: "Failed to record Mashallah." },
      { status: 500 },
    );
  }
}
