import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join",
  description:
    "Join deen.page and complete the shahadah onboarding flow to activate your builder profile.",
  openGraph: {
    title: "Join | deen.page",
    description: "Join deen.page and activate your builder profile.",
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
