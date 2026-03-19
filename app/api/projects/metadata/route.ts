import { NextRequest, NextResponse } from "next/server";
import { findIslamicKeywordMatches } from "@/lib/islamic-keywords";

/** Detect which kind of URL was pasted. */
function classifyUrl(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host === "apps.apple.com" || host === "itunes.apple.com")
    return "appstore";
  if (host === "play.google.com") return "playstore";
  if (host === "github.com") return "github";
  return "generic";
}

/** Extract Apple app ID from App Store / iTunes URL. */
function extractAppStoreId(url: string): string | null {
  try {
    const parsed = new URL(url);
    // apps.apple.com/us/app/name/id674912234 or itunes.apple.com/app/id674912234
    const pathMatch = parsed.pathname.match(/\/id(\d+)(?:\?|$|\/)/i);
    if (pathMatch) return pathMatch[1];
    const idParam = parsed.searchParams.get("id");
    if (idParam && /^\d+$/.test(idParam)) return idParam;
    return null;
  } catch {
    return null;
  }
}

/** Fetch app name, full description & icon from iTunes Lookup API (better than og:description). */
async function fetchAppStoreFromItunesLookup(
  url: string
): Promise<{ title: string; description: string; favicon: string } | null> {
  const appId = extractAppStoreId(url);
  if (!appId) return null;

  const pathParts = new URL(url).pathname.split("/").filter(Boolean);
  const country = pathParts[0] && pathParts[0].length === 2 ? pathParts[0] : "us";
  const lookupUrl = `https://itunes.apple.com/lookup?id=${appId}&country=${country}`;

  try {
    const res = await fetch(lookupUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { resultCount?: number; results?: Array<Record<string, unknown>> };
    const app = data?.results?.[0];
    if (!app || typeof app !== "object") return null;

    const title = typeof app.trackName === "string" ? app.trackName.trim() : "";
    const description = typeof app.description === "string" ? app.description.trim() : "";
    const favicon =
      (typeof app.artworkUrl512 === "string" && app.artworkUrl512) ||
      (typeof app.artworkUrl100 === "string" && app.artworkUrl100) ||
      "";

    return { title, description, favicon };
  } catch {
    return null;
  }
}

/** Scrape an Apple App Store page for fallback title, description & icon (og:description is generic). */
function parseAppStore(html: string) {
  const title =
    html.match(
      /<h1[^>]*class="[^"]*product-header__title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i
    )?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() ||
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() ||
    "";

  const description =
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    "";

  const favicon =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    )?.[1] ||
    "";

  return { title, description, favicon };
}

/** Scrape a Google Play Store page for the app name, description & icon. */
function parsePlayStore(html: string) {
  // Title — og:title usually has the clean app name
  const ogTitle =
    html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i
    )?.[1] ||
    "";
  // Strip " - Apps on Google Play" suffix
  const title = ogTitle.replace(/\s*[-–—]\s*Apps on Google Play$/i, "").trim();

  // Description — og:description
  const description =
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    "";

  // Icon — og:image has the app icon
  const favicon =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    )?.[1] ||
    "";

  return { title, description, favicon };
}

/** Scrape a GitHub repo page for repo name, description & owner avatar. */
function parseGitHub(html: string, url: string) {
  // Repo name from URL path
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  const repoFullName = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : "";

  // og:title is usually "owner/repo: description"
  const ogTitle =
    html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i
    )?.[1] ||
    "";

  const title = repoFullName || ogTitle.split(":")[0]?.trim() || "";

  const description =
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    "";

  // og:image for the repo (social preview or owner avatar)
  const favicon =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    )?.[1] ||
    "";

  return { title, description, favicon };
}

/** Generic website metadata scraper (original logic). */
function parseGeneric(html: string, url: string) {
  const parsed = new URL(url);
  const base = `${parsed.protocol}//${parsed.host}`;

  const title =
    html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i
    )?.[1] ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
    parsed.hostname;

  const description =
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i
    )?.[1] ||
    "";

  const faviconMatch =
    html.match(
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i
    ) ||
    html.match(
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i
    ) ||
    html.match(
      /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i
    );
  let favicon = faviconMatch?.[1];
  if (favicon) {
    favicon = favicon.startsWith("//")
      ? `${parsed.protocol}${favicon}`
      : favicon.startsWith("/")
        ? `${base}${favicon}`
        : favicon.startsWith("http")
          ? favicon
          : `${base}/${favicon}`;
  } else {
    favicon = `${base}/favicon.ico`;
  }

  return { title: title || parsed.hostname, description, favicon };
}

// GET: Fetch metadata (title, description, favicon) from a URL
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "url query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const urlType = classifyUrl(url);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: 400 }
      );
    }

    const html = await res.text();

    let title = "";
    let description = "";
    let favicon = "";

    switch (urlType) {
      case "appstore": {
        const itunesData = await fetchAppStoreFromItunesLookup(url);
        if (itunesData?.description) {
          title = itunesData.title;
          description = itunesData.description;
          favicon = itunesData.favicon;
        } else {
          const data = parseAppStore(html);
          title = data.title;
          description = data.description;
          favicon = data.favicon;
        }
        break;
      }
      case "playstore": {
        const data = parsePlayStore(html);
        title = data.title;
        description = data.description;
        favicon = data.favicon;
        break;
      }
      case "github": {
        const data = parseGitHub(html, url);
        title = data.title;
        description = data.description;
        favicon = data.favicon;
        break;
      }
      default: {
        const data = parseGeneric(html, url);
        title = data.title;
        description = data.description;
        favicon = data.favicon;
        break;
      }
    }

    // Determine suggested categories based on URL type
    const suggestedCategories: string[] = [];
    if (urlType === "appstore") suggestedCategories.push("ios");
    if (urlType === "playstore") suggestedCategories.push("android");
    if (urlType === "github") suggestedCategories.push("repo");

    // Determine which store/repo link field to auto-fill
    const autoFilledLinks: Record<string, string> = {};
    if (urlType === "appstore") autoFilledLinks.appStoreUrl = url;
    if (urlType === "playstore") autoFilledLinks.playStoreUrl = url;
    if (urlType === "github") autoFilledLinks.githubUrl = url;

    const matchedKeywords = findIslamicKeywordMatches(title, description);

    return NextResponse.json({
      title: title || new URL(url).hostname,
      description: description || "",
      favicon,
      matchedKeywords,
      matchesIslamicKeywords: matchedKeywords.length > 0,
      suggestedCategories,
      autoFilledLinks,
      urlType,
    });
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata from URL" },
      { status: 500 }
    );
  }
}
