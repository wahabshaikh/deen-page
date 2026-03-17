import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { Project } from "@/lib/models/project";
import { auth } from "@/lib/auth";
import { findIslamicKeywordMatches } from "@/lib/islamic-keywords";
import { headers } from "next/headers";

// POST: Create a new project
export async function POST(req: NextRequest) {
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
        { error: "Only verified builders can add projects" },
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
    } = body;

    const cats = Array.isArray(categories) ? categories : [categories];
    if (!title || !description || !url || !cats.length) {
      return NextResponse.json(
        { error: "title, description, url, and at least one category are required" },
        { status: 400 }
      );
    }

    const matchedKeywords = findIslamicKeywordMatches(title, description);
    const isPublic = matchedKeywords.length > 0;

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
      isPublic,
      matchedKeywords,
    });

    return NextResponse.json({ project, matchedKeywords, isPublic }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
