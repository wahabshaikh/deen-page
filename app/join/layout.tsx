import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join",
  description:
    "Get your invite to list your project on deen.page — Muslim Builders & Islamic Projects.",
  openGraph: {
    title: "Join | deen.page",
    description: "Get your invite to list your project on deen.page.",
    images: [
      { url: "/api/og?type=page&page=join", width: 1200, height: 630, alt: "Join — deen.page" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join | deen.page",
    images: ["/api/og?type=page&page=join"],
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
