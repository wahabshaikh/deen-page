import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { Invite } from "@/lib/models/invite";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { INVITES_PER_BUILDER, INVITE_EXPIRY_DAYS } from "@/lib/constants";
import crypto from "crypto";

type SessionUser = { xHandle?: string };

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user already has a verified builder profile
    const existingVerified = await Builder.findOne({
      userId: session.user.id,
      status: "verified",
    });
    if (existingVerified) {
      return NextResponse.json({
        message: "Already verified!",
        builder: existingVerified,
      });
    }

    // Try to find an indexed builder whose X handle matches
    // Better Auth stores the Twitter handle via mapProfileToUser -> xHandle
    const xHandle = (session.user as SessionUser).xHandle?.toLowerCase() ?? "";

    // Look for an indexed builder with matching X handle
    const indexedBuilder = await Builder.findOne({
      xHandle: { $regex: new RegExp(`^${xHandle}$`, "i") },
      status: "indexed",
    });

    if (indexedBuilder) {
      // Claim the indexed profile
      indexedBuilder.status = "verified";
      indexedBuilder.userId = session.user.id;
      if (session.user.image) {
        indexedBuilder.avatar = session.user.image;
      }
      await indexedBuilder.save();

      // Generate invite codes
      const invites = [];
      for (let i = 0; i < INVITES_PER_BUILDER; i++) {
        invites.push({
          code: crypto.randomBytes(4).toString("hex"),
          createdBy: indexedBuilder._id,
          expiresAt: new Date(
            Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
          ),
          status: "active",
        });
      }
      await Invite.insertMany(invites);

      return NextResponse.json({
        message: "Profile verified successfully!",
        builder: indexedBuilder,
      });
    }

    return NextResponse.json(
      {
        error:
          "No indexed profile found matching your X handle. Try joining with an invite code instead.",
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("Error verifying builder:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
