/**
 * Normalize a string into a URL-safe slug: lowercase, alphanumeric + hyphens only.
 */
export function normalizeSlug(value: string): string {
  const slug = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "";
}

/**
 * Normalize username (builder profile URL): lowercase, alphanumeric + underscores only.
 */
export function normalizeUsername(value: string): string {
  const username = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
  return username || "";
}
