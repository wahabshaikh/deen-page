import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Invite } from "@/lib/models/invite";
import { Builder } from "@/lib/models/builder";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { INVITES_PER_BUILDER, INVITE_EXPIRY_DAYS } from "@/lib/constants";
import crypto from "crypto";

// GET: List my invite codes
export async function GET(req: NextRequest) {
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
        { error: "Only verified builders can view invites" },
        { status: 403 },
      );
    }

    const invites = await Invite.find({ createdBy: builder._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 },
    );
  }
}

// POST: Generate invite codes OR redeem an invite
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Redeem an invite
    if (body.action === "redeem") {
      const { code } = body;
      if (!code) {
        return NextResponse.json(
          { error: "Invite code is required" },
          { status: 400 },
        );
      }

      const invite = await Invite.findOne({ code, status: "active" });
      if (!invite) {
        return NextResponse.json(
          { error: "Invalid or expired invite code" },
          { status: 400 },
        );
      }

      if (new Date() > invite.expiresAt) {
        invite.status = "expired";
        await invite.save();
        return NextResponse.json(
          { error: "Invite code has expired" },
          { status: 400 },
        );
      }

      // Check if user already has a builder profile
      const existing = await Builder.findOne({ userId: session.user.id });
      if (existing) {
        return NextResponse.json(
          { error: "You already have a builder profile" },
          { status: 400 },
        );
      }

      // Create builder profile (use X handle from session)
      const xHandle =
        (session.user as { xHandle?: string }).xHandle?.toLowerCase() ?? "";
      if (!xHandle) {
        return NextResponse.json(
          { error: "X handle not found. Please sign in with X again." },
          { status: 400 },
        );
      }

      const builder = await Builder.create({
        name: session.user.name || "Servant of Allah",
        xHandle,
        avatar: session.user.image,
        status: "verified",
        userId: session.user.id,
        invitedBy: invite.createdBy,
        slug: xHandle,
      });

      // Mark invite as redeemed
      invite.status = "redeemed";
      invite.redeemedBy = builder._id;
      await invite.save();

      // Generate invite codes for new builder
      const newInvites = [];
      for (let i = 0; i < INVITES_PER_BUILDER; i++) {
        newInvites.push({
          code: crypto.randomBytes(4).toString("hex"),
          createdBy: builder._id,
          expiresAt: new Date(
            Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
          ),
          status: "active",
        });
      }
      await Invite.insertMany(newInvites);

      return NextResponse.json({ builder, message: "Welcome aboard!" });
    }

    // Generate new invite codes (for verified builders)
    if (body.action === "generate") {
      const builder = await Builder.findOne({ userId: session.user.id });
      if (!builder || builder.status !== "verified") {
        return NextResponse.json(
          { error: "Only verified builders can generate invites" },
          { status: 403 },
        );
      }

      const existingCount = await Invite.countDocuments({
        createdBy: builder._id,
      });
      const remaining = INVITES_PER_BUILDER - existingCount;

      if (remaining <= 0) {
        return NextResponse.json(
          { error: "No invite codes remaining" },
          { status: 400 },
        );
      }

      const invites = [];
      for (let i = 0; i < remaining; i++) {
        invites.push({
          code: crypto.randomBytes(4).toString("hex"),
          createdBy: builder._id,
          expiresAt: new Date(
            Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
          ),
          status: "active",
        });
      }
      await Invite.insertMany(invites);

      return NextResponse.json({
        invites,
        message: `${invites.length} invite codes generated`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error with invites:", error);
    return NextResponse.json(
      { error: "Failed to process invite" },
      { status: 500 },
    );
  }
}
