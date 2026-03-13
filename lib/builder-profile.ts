import { Builder } from "@/lib/models/builder";
import { upgradeTwitterProfileImage } from "@/lib/url";

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

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || "builder";
}

async function ensureUniqueBuilderSlug(seed: string, ignoreId?: string) {
  const baseSlug = slugify(seed);
  let slug = baseSlug;
  let counter = 1;

  while (
    await Builder.findOne({
      slug,
      ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
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
    existingByUser.slug =
      existingByUser.slug ||
      (await ensureUniqueBuilderSlug(xHandle, existingByUser._id.toString()));
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
    existingByHandle.slug =
      existingByHandle.slug ||
      (await ensureUniqueBuilderSlug(xHandle, existingByHandle._id.toString()));
    await existingByHandle.save();
    return existingByHandle;
  }

  const slug = await ensureUniqueBuilderSlug(xHandle);

  return Builder.create({
    name,
    xHandle,
    avatar,
    status: "verified",
    userId: session.user.id,
    slug,
  });
}
