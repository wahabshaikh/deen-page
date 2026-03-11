import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { upgradeTwitterProfileImage } from "@/lib/url";

const TWITTER_API_BASE = "https://api.twitterapi.io";

interface TwitterUserInfo {
  userName?: string;
  name?: string;
  profilePicture?: string;
  description?: string;
  location?: string;
  unavailable?: boolean;
  message?: string;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userName = req.nextUrl.searchParams.get("userName")?.trim();
  if (!userName) {
    return NextResponse.json(
      { error: "userName query parameter is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.TWITTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TWITTER_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const handle = userName.replace(/^@/, "");
  const url = `${TWITTER_API_BASE}/twitter/user/info?userName=${encodeURIComponent(handle)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
      },
      signal: AbortSignal.timeout(15000),
    });

    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.msg ?? json?.message ?? "Failed to fetch profile" },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }

    const data = json.data as TwitterUserInfo | undefined;
    if (!data) {
      return NextResponse.json(
        { error: "Invalid response from Twitter API" },
        { status: 502 }
      );
    }

    if (data.unavailable) {
      return NextResponse.json(
        { error: data.message ?? "This account is unavailable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: data.name ?? "",
      userName: data.userName ?? handle,
      profilePicture: upgradeTwitterProfileImage(data.profilePicture) ?? data.profilePicture ?? null,
      description: data.description ?? "",
      location: data.location ?? "",
    });
  } catch (err) {
    console.error("Twitter profile fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Twitter profile" },
      { status: 502 }
    );
  }
}
