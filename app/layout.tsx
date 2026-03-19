import type { Metadata } from "next";
import { Amiri, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["latin", "arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://deen.page"),
  title: {
    default: "deen.page — Discover what the Ummah is building",
    template: "%s | deen.page",
  },
  description:
    "Find Muslim builders and Islamic projects in one place. Discover, support, and get discovered.",
  openGraph: {
    title: "deen.page — Discover what the Ummah is building",
    description:
      "Find Muslim builders and Islamic projects. Discover, support, and get discovered.",
    url: "https://deen.page",
    siteName: "deen.page",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "deen.page — Discover what the Ummah is building",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "deen.page — Discover what the Ummah is building",
    description:
      "Find Muslim builders and Islamic projects. Discover, support, and get discovered.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="deen"
      className="overflow-x-hidden"
      style={{ colorScheme: "dark" }}
    >
      <head>
        <Script
          defer
          data-website-id="dfid_CB9U6JtJTDb4hJg3Uw1de"
          data-domain="deen.page"
          src="https://datafa.st/js/script.js"
        ></Script>
      </head>
      <body
        className={`${amiri.variable} ${plusJakartaSans.variable} font-sans antialiased bg-base-100 text-base-content min-h-screen flex flex-col selection:bg-primary selection:text-primary-content overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
