import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { Project } from "@/lib/models/project";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";
import { upgradeTwitterProfileImage } from "@/lib/url";

export const runtime = "nodejs";

// Brand colors (hex for OG compatibility) — from globals.css deen theme
const OG = {
  width: 1200,
  height: 630,
  padding: 48,
  bg: "#0d1210",
  bgGradient: "linear-gradient(145deg, #0d1210 0%, #131c18 50%, #0f1814 100%)",
  surface: "rgba(26, 37, 32, 0.6)",
  gold: "#d4af37",
  goldMuted: "rgba(212, 175, 55, 0.5)",
  green: "#2d4a3e",
  text: "#e8e6e3",
  textMuted: "rgba(232, 230, 227, 0.65)",
  border: "rgba(212, 175, 55, 0.25)",
  fontDisplay: "Playfair Display",
  fontSans: "Manrope",
} as const;

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  home: {
    title: "deen.page",
    subtitle: "Muslim Builders & Islamic Projects",
  },
  builders: {
    title: "Builders",
    subtitle: "Muslim developers, founders & indie hackers",
  },
  projects: {
    title: "Projects",
    subtitle: "Islamic technology built by the community",
  },
  join: {
    title: "Join",
    subtitle: "Take the shahadah to activate your builder profile",
  },
  verify: {
    title: "Verify",
    subtitle: "Claim and manage your builder profile on deen.page",
  },
};

async function loadFonts(): Promise<
  { name: string; data: ArrayBuffer; style: "normal"; weight: 400 | 600 | 700 }[]
> {
  const [playfairRes, manropeRes] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2"
    ),
    fetch(
      "https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRggqxSuXd.woff2"
    ),
  ]);
  const playfair = await playfairRes.arrayBuffer();
  const manrope = await manropeRes.arrayBuffer();
  return [
    { name: OG.fontDisplay, data: playfair, style: "normal", weight: 400 },
    { name: OG.fontDisplay, data: playfair, style: "normal", weight: 700 },
    { name: OG.fontSans, data: manrope, style: "normal", weight: 400 },
    { name: OG.fontSans, data: manrope, style: "normal", weight: 600 },
  ];
}

function OgFrame({
  children,
  showBrandBar = true,
}: {
  children: React.ReactNode;
  showBrandBar?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: OG.bgGradient,
        fontFamily: OG.fontSans,
        color: OG.text,
        padding: OG.padding,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top gold accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${OG.goldMuted}, ${OG.gold}, ${OG.goldMuted}, transparent)`,
          opacity: 0.8,
        }}
      />
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 500,
          height: 500,
          background: `radial-gradient(circle, ${OG.goldMuted} 0%, transparent 70%)`,
          opacity: 0.15,
          pointerEvents: "none",
        }}
      />
      {children}
      {showBrandBar && (
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: `1px solid ${OG.border}`,
            fontSize: 22,
            color: OG.textMuted,
            fontFamily: OG.fontSans,
          }}
        >
          <span>deen.page</span>
          <span style={{ color: OG.gold, fontWeight: 600 }}>
            Muslim Builders & Islamic Projects
          </span>
        </div>
      )}
    </div>
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");
  const page = searchParams.get("page");
  const category = searchParams.get("category");

  let fonts: { name: string; data: ArrayBuffer; style: "normal"; weight: 400 | 600 | 700 }[];
  try {
    fonts = await loadFonts();
  } catch {
    fonts = [];
  }

  const opts = { width: OG.width, height: OG.height, fonts };

  // ——— Default: Home OG (no type or type=page&page=home) ———
  if (!type || (type === "page" && (!page || page === "home"))) {
    return new ImageResponse(
      (
        <OgFrame>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              paddingBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: OG.fontDisplay,
                fontSize: 88,
                fontWeight: 700,
                color: OG.text,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              deen.page
            </div>
            <div
              style={{
                fontFamily: OG.fontSans,
                fontSize: 30,
                color: OG.textMuted,
                marginTop: 16,
                maxWidth: 700,
              }}
            >
              Muslim Builders & Islamic Projects
            </div>
            <div
              style={{
                fontFamily: OG.fontSans,
                fontSize: 22,
                color: OG.gold,
                marginTop: 28,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              For the Ummah
            </div>
          </div>
        </OgFrame>
      ),
      opts
    );
  }

  // ——— Static pages: type=page&page=builders|projects|join|verify ———
  if (type === "page" && page && PAGE_TITLES[page]) {
    const { title, subtitle } = PAGE_TITLES[page];
    return new ImageResponse(
      (
        <OgFrame>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: OG.fontDisplay,
                fontSize: 72,
                fontWeight: 700,
                color: OG.text,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: OG.fontSans,
                fontSize: 28,
                color: OG.textMuted,
                marginTop: 20,
                maxWidth: 720,
              }}
            >
              {subtitle}
            </div>
          </div>
        </OgFrame>
      ),
      opts
    );
  }

  // ——— Category: type=category&category=web ———
  if (type === "category" && category) {
    const label =
      CATEGORY_LABELS[category as Category] ||
      category.charAt(0).toUpperCase() + category.slice(1);
    return new ImageResponse(
      (
        <OgFrame>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: OG.fontSans,
                fontSize: 18,
                color: OG.gold,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Category
            </div>
            <div
              style={{
                fontFamily: OG.fontDisplay,
                fontSize: 64,
                fontWeight: 700,
                color: OG.text,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {label} Projects
            </div>
            <div
              style={{
                fontFamily: OG.fontSans,
                fontSize: 26,
                color: OG.textMuted,
                marginTop: 16,
              }}
            >
              Discover {label.toLowerCase()} projects on deen.page
            </div>
          </div>
        </OgFrame>
      ),
      opts
    );
  }

  // ——— Builder & Project require slug and DB ———
  if (!slug) {
    return new ImageResponse(
      (
        <OgFrame>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              color: OG.textMuted,
            }}
          >
            Missing slug
          </div>
        </OgFrame>
      ),
      opts
    );
  }

  await connectDB();

  if (type === "builder") {
    const builder = await Builder.findOne({ username: slug }).lean();
    if (!builder) {
      return new ImageResponse(
        (
          <OgFrame>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: OG.textMuted,
              }}
            >
              Builder not found
            </div>
          </OgFrame>
        ),
        opts
      );
    }

    return new ImageResponse(
      (
        <OgFrame>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              marginBottom: 32,
            }}
          >
            {builder.avatar ? (
              <img
                src={upgradeTwitterProfileImage(builder.avatar) ?? builder.avatar}
                width={112}
                height={112}
                style={{
                  borderRadius: "50%",
                  border: `3px solid ${OG.gold}`,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: "50%",
                  background: OG.surface,
                  border: `3px solid ${OG.gold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: OG.fontDisplay,
                  fontSize: 44,
                  fontWeight: 700,
                  color: OG.gold,
                }}
              >
                {builder.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  fontFamily: OG.fontDisplay,
                  fontSize: 52,
                  fontWeight: 700,
                  color: OG.text,
                  letterSpacing: "-0.02em",
                }}
              >
                {builder.name}
              </div>
              <div
                style={{
                  fontFamily: OG.fontSans,
                  fontSize: 26,
                  color: OG.textMuted,
                }}
              >
                @{builder.xHandle}
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: "auto",
              paddingTop: 24,
              fontSize: 22,
              color: OG.textMuted,
              fontFamily: OG.fontSans,
            }}
          >
            deen.page/{builder.username}
          </div>
        </OgFrame>
      ),
      opts
    );
  }

  if (type === "project") {
    const project = await Project.findOne({ slug })
      .populate("builderId", "name xHandle")
      .lean();

    if (!project) {
      return new ImageResponse(
        (
          <OgFrame>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: OG.textMuted,
              }}
            >
              Project not found
            </div>
          </OgFrame>
        ),
        opts
      );
    }

    const builder = project.builderId as { name?: string } | null;
    const categories = (project.categories as string[]) || [];
    const categoryLabel =
      categories.length > 0
        ? categories
            .map((c) => CATEGORY_LABELS[c as Category] || c)
            .join(" · ")
        : "";

    return new ImageResponse(
      (
        <OgFrame>
          {categoryLabel ? (
            <div
              style={{
                fontFamily: OG.fontSans,
                fontSize: 18,
                color: OG.gold,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              {categoryLabel}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: OG.fontDisplay,
              fontSize: 56,
              fontWeight: 700,
              color: OG.text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: 1000,
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              fontFamily: OG.fontSans,
              fontSize: 24,
              color: OG.textMuted,
              marginTop: 20,
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {project.description.length > 120
              ? `${project.description.slice(0, 120).trim()}…`
              : project.description}
          </div>
          {builder?.name && (
            <div
              style={{
                marginTop: "auto",
                paddingTop: 24,
                fontSize: 22,
                color: OG.textMuted,
                fontFamily: OG.fontSans,
              }}
            >
              by {builder.name} · deen.page
            </div>
          )}
        </OgFrame>
      ),
      opts
    );
  }

  return new Response("Invalid type", { status: 400 });
}
