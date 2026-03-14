import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { Project } from "@/lib/models/project";
import { auth } from "@/lib/auth";
import { findIslamicKeywordMatches } from "@/lib/islamic-keywords";
import { headers } from "next/headers";
import { normalizeSlug } from "@/lib/slug";

// PUT: Update a project (verified builders only, own projects only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const builder = await Builder.findOne({ userId: session.user.id });
    if (!builder || builder.status !== "verified") {
      return NextResponse.json(
        { error: "Only verified builders can edit projects" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const project = await Project.findOne({ slug });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.builderId.equals(builder._id)) {
      return NextResponse.json(
        { error: "You can only edit your own projects" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      url,
      categories,
      favicon,
      githubUrl,
      appStoreUrl,
      playStoreUrl,
      chromeStoreUrl,
      slug: slugInput,
    } = body;

    const cats = Array.isArray(categories) ? categories : [categories];
    if (!title || !description || !url || !cats.length) {
      return NextResponse.json(
        { error: "title, description, url, and at least one category are required" },
        { status: 400 }
      );
    }

    const matchedKeywords = findIslamicKeywordMatches(title, description);
    if (!matchedKeywords.length) {
      return NextResponse.json(
        { error: "Project cant be updated, contact support." },
        { status: 400 }
      );
    }

    if (slugInput !== undefined) {
      const rawSlug = slugInput?.trim();
      if (!rawSlug) {
        return NextResponse.json(
          { error: "Project URL cannot be empty." },
          { status: 400 }
        );
      }
      const newSlug = normalizeSlug(rawSlug);
      if (!newSlug) {
        return NextResponse.json(
          { error: "Project URL must contain at least one letter or number." },
          { status: 400 }
        );
      }
      const existing = await Project.findOne({
        slug: newSlug,
        _id: { $ne: project._id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This project URL is already taken." },
          { status: 400 }
        );
      }
      project.slug = newSlug;
    }

    project.title = title;
    project.description = description;
    project.url = url;
    project.categories = cats.filter((c: string) => c);
    project.favicon = favicon || undefined;
    project.githubUrl = githubUrl || undefined;
    project.appStoreUrl = appStoreUrl || undefined;
    project.playStoreUrl = playStoreUrl || undefined;
    project.chromeStoreUrl = chromeStoreUrl || undefined;
    await project.save();

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a project (verified builders only, own projects only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const builder = await Builder.findOne({ userId: session.user.id });
    if (!builder || builder.status !== "verified") {
      return NextResponse.json(
        { error: "Only verified builders can delete projects" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const project = await Project.findOne({ slug });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.builderId.equals(builder._id)) {
      return NextResponse.json(
        { error: "You can only delete your own projects" },
        { status: 403 }
      );
    }

    await Project.deleteOne({ _id: project._id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
