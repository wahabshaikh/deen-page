import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { claimIndexedBuilder } from "@/lib/builder-profile";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const builder = await claimIndexedBuilder({
      user: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
        xHandle: (session.user as { xHandle?: string }).xHandle,
      },
    });

    return NextResponse.json({
      message: "Profile claimed.",
      builder,
    });
  } catch (error) {
    console.error("Claim builder error:", error);
    const message =
      error instanceof Error ? error.message : "Claim failed";
    const status =
      message.includes("No unclaimed") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
