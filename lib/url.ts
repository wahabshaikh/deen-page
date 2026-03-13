const REF_PARAM = "ref=deen.page";

/**
 * Upgrades X/Twitter profile image URLs from low-res (_normal, 48x48) to
 * high-res (400x400). pbs.twimg.com URLs use _normal by default.
 */
export function upgradeTwitterProfileImage(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  if (!url.includes("pbs.twimg.com")) return url;
  return url.replace(/_normal\./, "_400x400.");
}

/**
 * Appends ?ref=deen.page to external URLs so destination sites can attribute
 * traffic in their analytics (works even with rel="noreferrer").
 */
/**
 * Builds a URL from a base path and search params with key/value overrides.
 * Pass `null` as a value to remove that param.
 */
export function buildFilterUrl(
  basePath: string,
  params: URLSearchParams,
  overrides: Record<string, string | null>,
): string {
  const next = new URLSearchParams(params);
  for (const [k, v] of Object.entries(overrides)) {
    if (v == null) next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  const path = basePath === "/" ? "/" : basePath;
  return qs ? `${path}?${qs}` : path;
}

export function addRefParam(url: string): string {
  if (!url || typeof url !== "string") return url;
  try {
    const hasQuery = url.includes("?");
    const separator = hasQuery ? "&" : "?";
    return `${url}${separator}${REF_PARAM}`;
  } catch {
    return url;
  }
}
