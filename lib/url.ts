const REF_PARAM = "ref=deen.page";

/**
 * Appends ?ref=deen.page to external URLs so destination sites can attribute
 * traffic in their analytics (works even with rel="noreferrer").
 */
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
