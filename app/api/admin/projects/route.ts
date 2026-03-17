import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { Project } from "@/lib/models/project";
import { getAdminSession } from "@/lib/admin";

// POST: Create a project for a builder (admin only)
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const body = await req.json();
    const {
      builderId,
      title,
      description,
      url,
      categories,
      favicon,
      githubUrl,
      appStoreUrl,
      playStoreUrl,
      chromeStoreUrl,
    } = body;

    const cats = Array.isArray(categories) ? categories : [categories];
    if (!builderId || !title || !description || !url || !cats.length) {
      return NextResponse.json(
        {
          error:
            "builderId, title, description, url, and at least one category are required",
        },
        { status: 400 }
      );
    }

    const builder = await Builder.findById(builderId);
    if (!builder) {
      return NextResponse.json(
        { error: "Builder not found" },
        { status: 404 }
      );
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug;
    let counter = 1;
    while (await Project.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const project = await Project.create({
      title,
      description,
      url,
      categories: cats.filter((c: string) => c),
      favicon: favicon || undefined,
      githubUrl: githubUrl || undefined,
      appStoreUrl: appStoreUrl || undefined,
      playStoreUrl: playStoreUrl || undefined,
      chromeStoreUrl: chromeStoreUrl || undefined,
      builderId: builder._id,
      slug,
      isPublic: true,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Admin create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
