import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/project";
import { getAdminSession } from "@/lib/admin";
import { normalizeSlug } from "@/lib/slug";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing project ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      url,
      slug: slugInput,
      categories,
      favicon,
      githubUrl,
      appStoreUrl,
      playStoreUrl,
      chromeStoreUrl,
    } = body;

    const cats = Array.isArray(categories) ? categories : [categories];
    if (!title || !description || !url || !cats.length) {
      return NextResponse.json(
        {
          error:
            "title, description, url, and at least one category are required",
        },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = {
      title,
      description,
      url,
      categories: cats.filter((c: string) => c),
      favicon: favicon || undefined,
      githubUrl: githubUrl || undefined,
      appStoreUrl: appStoreUrl || undefined,
      playStoreUrl: playStoreUrl || undefined,
      chromeStoreUrl: chromeStoreUrl || undefined,
    };

    if (slugInput !== undefined && typeof slugInput === "string") {
      const newSlug = normalizeSlug(slugInput);
      if (newSlug) {
        const existing = await Project.findOne({ slug: newSlug });
        if (!existing || String(existing._id) === id) {
          update.slug = newSlug;
        }
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Admin edit project error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing project ID" },
        { status: 400 }
      );
    }

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Admin delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
