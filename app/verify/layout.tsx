import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify",
  description:
    "Verify your builder profile on deen.page to get full editing access.",
  openGraph: {
    title: "Verify | deen.page",
    description: "Verify your builder profile on deen.page.",
    images: [
      { url: "/api/og?type=page&page=verify", width: 1200, height: 630, alt: "Verify — deen.page" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify | deen.page",
    images: ["/api/og?type=page&page=verify"],
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
