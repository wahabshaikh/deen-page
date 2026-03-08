import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { getAdminSession } from "@/lib/admin";
import { Project } from "@/lib/models/project";

// GET: List all builders (for admin dropdown / overview)
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const builders = await Builder.find()
      .sort({ createdAt: -1 })
      .lean();
    
    const projects = await Project.find().lean();

    const buildersWithProjects = builders.map((builder: any) => {
      const builderProjects = projects.filter(
        (p: any) => p.builderId?.toString() === builder._id.toString()
      );
      return { ...builder, projects: builderProjects };
    });

    return NextResponse.json({ builders: buildersWithProjects });
  } catch (error) {
    console.error("Admin GET builders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch builders" },
      { status: 500 }
    );
  }
}

// POST: Create a new builder (indexed)
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const body = await req.json();
    const {
      name,
      xHandle,
      slug,
      avatar,
      country,
      githubUrl,
      websiteUrl,
      supportLink,
      statusTags,
      stack,
    } = body;

    if (!name || !xHandle || !slug) {
      return NextResponse.json(
        { error: "name, xHandle, and slug are required" },
        { status: 400 }
      );
    }

    const normalizedSlug = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/(^-|-$)/g, "");
    const normalizedHandle = String(xHandle).replace(/^@/, "").toLowerCase();

    const existing = await Builder.findOne({
      $or: [{ slug: normalizedSlug }, { xHandle: normalizedHandle }],
    });
    if (existing) {
      return NextResponse.json(
        { error: "A builder with this slug or X handle already exists" },
        { status: 409 }
      );
    }

    const builder = await Builder.create({
      name: String(name).trim(),
      xHandle: normalizedHandle,
      slug: normalizedSlug,
      avatar: avatar || undefined,
      country: country?.trim() || undefined,
      githubUrl: githubUrl?.trim() || undefined,
      websiteUrl: websiteUrl?.trim() || undefined,
      supportLink: supportLink?.trim() || undefined,
      statusTags: Array.isArray(statusTags) ? statusTags : [],
      stack: Array.isArray(stack) ? stack : [],
      status: "indexed",
    });

    return NextResponse.json({ builder }, { status: 201 });
  } catch (error) {
    console.error("Admin POST builder error:", error);
    return NextResponse.json(
      { error: "Failed to create builder" },
      { status: 500 }
    );
  }
}
