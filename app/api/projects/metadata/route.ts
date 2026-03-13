import { NextRequest, NextResponse } from "next/server";
import { findIslamicKeywordMatches } from "@/lib/islamic-keywords";

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
    const parsed = new URL(url);
    const base = `${parsed.protocol}//${parsed.host}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; deen-page/1.0; +https://deen.page)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: 400 }
      );
    }

    const html = await res.text();

    const title =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1] ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
      parsed.hostname;

    const description =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1] ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1] ||
      "";

    const faviconMatch =
      html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i) ||
      html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i);
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

    const matchedKeywords = findIslamicKeywordMatches(title, description);

    return NextResponse.json({
      title: title || parsed.hostname,
      description: description || "",
      favicon,
      matchedKeywords,
      matchesIslamicKeywords: matchedKeywords.length > 0,
    });
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata from URL" },
      { status: 500 }
    );
  }
}
