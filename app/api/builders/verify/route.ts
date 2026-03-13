import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { claimOrCreateVerifiedBuilder } from "@/lib/builder-profile";
import { connectDB } from "@/lib/db";
import { isValidShahadahResponse } from "@/lib/shahadah";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const language =
      typeof body.language === "string" ? body.language : "";
    const responseText =
      typeof body.responseText === "string" ? body.responseText : "";

    if (!isValidShahadahResponse(language, responseText)) {
      return NextResponse.json(
        { error: "Please type the shahadah exactly as shown." },
        { status: 400 },
      );
    }

    await connectDB();

    const builder = await claimOrCreateVerifiedBuilder({
      user: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
        xHandle: (session.user as { xHandle?: string }).xHandle,
      },
    });

    return NextResponse.json({
      message: "Verified builder profile created.",
      builder,
    });
  } catch (error) {
    console.error("Error creating verified builder:", error);
    const message =
      error instanceof Error ? error.message : "Verification failed";
    const status =
      message === "A builder profile already exists for this X handle."
        ? 409
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
