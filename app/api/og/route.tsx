import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";
import { Project } from "@/lib/models/project";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "builder" or "project"
  const slug = searchParams.get("slug");

  if (!type || !slug) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1a1a2e 0%, #0f3d0f 100%)",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 700 }}>deen.page</div>
          <div style={{ fontSize: 24, opacity: 0.7, marginTop: 16 }}>
            Muslim Builders & Islamic Projects
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  await connectDB();

  if (type === "builder") {
    const builder = await Builder.findOne({ slug }).lean();
    if (!builder) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "#1a1a2e",
              color: "white",
              fontSize: 32,
            }}
          >
            Builder not found
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1a1a2e 0%, #0f3d0f 100%)",
            color: "white",
            fontFamily: "sans-serif",
            padding: 80,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {builder.avatar && (
              <img
                src={builder.avatar}
                width={100}
                height={100}
                style={{ borderRadius: "50%", border: "3px solid #1db954" }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 48, fontWeight: 700 }}>
                {builder.name}
              </div>
              <div style={{ fontSize: 24, opacity: 0.6 }}>
                @{builder.xHandle}
              </div>
            </div>
          </div>
          {builder.stack && builder.stack.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 32,
                flexWrap: "wrap",
              }}
            >
              {builder.stack.slice(0, 5).map((tech: string) => (
                <div
                  key={tech}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: 18,
                  }}
                >
                  {tech}
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              marginTop: "auto",
              fontSize: 28,
              opacity: 0.5,
            }}
          >
            deen.page/{builder.slug}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  if (type === "project") {
    const project = await Project.findOne({ slug })
      .populate("builderId", "name xHandle")
      .lean();

    if (!project) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "#1a1a2e",
              color: "white",
              fontSize: 32,
            }}
          >
            Project not found
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const builder = project.builderId as any;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1a1a2e 0%, #0f3d0f 100%)",
            color: "white",
            fontFamily: "sans-serif",
            padding: 80,
          }}
        >
          <div style={{ fontSize: 20, opacity: 0.5, marginBottom: 16 }}>
            {project.categories?.join(" · ") || ""}
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
            {project.title}
          </div>
          <div
            style={{
              fontSize: 24,
              opacity: 0.7,
              marginTop: 24,
              lineHeight: 1.4,
              maxWidth: 800,
            }}
          >
            {project.description.length > 150
              ? project.description.slice(0, 150) + "..."
              : project.description}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            <div style={{ fontSize: 20, opacity: 0.5 }}>
              {builder ? `by ${builder.name}` : ""}
            </div>
            <div style={{ fontSize: 28, opacity: 0.5 }}>deen.page</div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  return new Response("Invalid type", { status: 400 });
}
