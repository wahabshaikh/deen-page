import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { Project } from "@/lib/models/project";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET: Fetch current builder's profile + projects
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const builder = await Builder.findOne({ userId: session.user.id }).lean();
    if (!builder) {
      return NextResponse.json(
        { error: "No builder profile found" },
        { status: 404 },
      );
    }

    const projects = await Project.find({ builderId: builder._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ builder, projects });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}

// PUT: Update builder profile
export async function PUT(req: NextRequest) {
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
        { error: "Only verified builders can edit their profile" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const country = body.country?.trim();
    if (!country) {
      return NextResponse.json(
        { error: "Country is required." },
        { status: 400 },
      );
    }

    const allowedFields = [
      "name",
      "country",
      "stack",
      "githubUrl",
      "websiteUrl",
      "supportLink",
      "statusTags",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (builder as Record<string, unknown>)[field] = body[field];
      }
    }

    await builder.save();

    return NextResponse.json({ builder });
  } catch (error) {
    console.error("Dashboard PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
