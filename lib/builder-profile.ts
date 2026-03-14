import { Builder } from "@/lib/models/builder";
import { upgradeTwitterProfileImage } from "@/lib/url";
import { normalizeUsername } from "@/lib/slug";

type BuilderSession = {
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    xHandle?: string | null;
  };
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function ensureUniqueBuilderUsername(seed: string, ignoreId?: string) {
  const base = normalizeUsername(seed) || "builder";
  let username = base;
  let counter = 1;

  while (
    await Builder.findOne({
      username,
      ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
    })
  ) {
    username = `${base}_${counter}`;
    counter++;
  }

  return username;
}

export async function claimOrCreateVerifiedBuilder(session: BuilderSession) {
  const xHandle = session.user.xHandle?.replace(/^@/, "").trim().toLowerCase();

  if (!xHandle) {
    throw new Error("X handle not found. Please sign in with X again.");
  }

  const name = session.user.name?.trim() || "Muslim Builder";
  const avatar =
    upgradeTwitterProfileImage(session.user.image) ??
    session.user.image ??
    undefined;

  const existingByUser = await Builder.findOne({ userId: session.user.id });
  if (existingByUser) {
    const conflictingHandle = await Builder.findOne({
      _id: { $ne: existingByUser._id },
      xHandle: { $regex: new RegExp(`^${escapeRegExp(xHandle)}$`, "i") },
    });

    if (conflictingHandle?.userId && conflictingHandle.userId !== session.user.id) {
      throw new Error("A builder profile already exists for this X handle.");
    }

    existingByUser.name = existingByUser.name || name;
    existingByUser.xHandle = xHandle;
    existingByUser.avatar = avatar || existingByUser.avatar;
    existingByUser.status = "verified";
    existingByUser.userId = session.user.id;
    existingByUser.username =
      existingByUser.username ||
      (await ensureUniqueBuilderUsername(xHandle, existingByUser._id.toString()));
    await existingByUser.save();
    return existingByUser;
  }

  const existingByHandle = await Builder.findOne({
    xHandle: { $regex: new RegExp(`^${escapeRegExp(xHandle)}$`, "i") },
  });

  if (existingByHandle) {
    if (existingByHandle.userId && existingByHandle.userId !== session.user.id) {
      throw new Error("A builder profile already exists for this X handle.");
    }

    existingByHandle.name = existingByHandle.name || name;
    existingByHandle.xHandle = xHandle;
    existingByHandle.avatar = avatar || existingByHandle.avatar;
    existingByHandle.status = "verified";
    existingByHandle.userId = session.user.id;
    existingByHandle.username =
      existingByHandle.username ||
      (await ensureUniqueBuilderUsername(xHandle, existingByHandle._id.toString()));
    await existingByHandle.save();
    return existingByHandle;
  }

  const username = await ensureUniqueBuilderUsername(xHandle);

  return Builder.create({
    name,
    xHandle,
    avatar,
    status: "verified",
    userId: session.user.id,
    username,
  });
}
