import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeHandle(handle: string | undefined) {
  return handle?.replace(/^@/, "").trim().toLowerCase() || "";
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const xHandle = normalizeHandle(
      (session.user as { xHandle?: string }).xHandle
    );
    if (!xHandle) {
      return NextResponse.json(
        { error: "X handle not found. Sign in with X again." },
        { status: 400 }
      );
    }

    const byUser = await Builder.findOne({ userId: session.user.id }).lean();
    if (byUser) {
      return NextResponse.json({
        status: "has_builder",
        builder: byUser,
      });
    }

    const byHandle = await Builder.findOne({
      xHandle: { $regex: new RegExp(`^${escapeRegExp(xHandle)}$`, "i") },
    }).lean();

    if (byHandle && !byHandle.userId) {
      return NextResponse.json({
        status: "indexed_claim",
        builder: byHandle,
      });
    }

    return NextResponse.json({ status: "new_onboarding" });
  } catch (error) {
    console.error("Onboarding status error:", error);
    return NextResponse.json(
      { error: "Failed to get onboarding status" },
      { status: 500 }
    );
  }
}
