export const CATEGORIES = [
  "web",
  "ios",
  "android",
  "chrome-extension",
  "repo",
  "cli",
  "api",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  web: "Web",
  ios: "iOS",
  android: "Android",
  "chrome-extension": "Chrome Extension",
  repo: "Repo",
  cli: "CLI",
  api: "API",
};

export const STATUS_TAGS = [
  "Looking for Co-founder",
  "Raising Funds",
  "Available for Freelance",
  "Open Source Contributor",
  "Building in Public",
] as const;

export type StatusTag = (typeof STATUS_TAGS)[number];

export const BUILDER_STATES = ["indexed", "verified"] as const;
export type BuilderState = (typeof BUILDER_STATES)[number];

export const INVITE_STATES = ["active", "redeemed", "expired"] as const;
export type InviteState = (typeof INVITE_STATES)[number];

export const INVITES_PER_BUILDER = 3;
export const INVITE_EXPIRY_DAYS = 14;
