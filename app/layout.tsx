import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://deen.page"),
  title: {
    default: "deen.page — Muslim Builders & Islamic Projects",
    template: "%s | deen.page",
  },
  description:
    "Discover Muslim developers, founders, and indie hackers building islamic technology. The curated directory of Muslim Builders & Islamic Projects for the Ummah.",
  openGraph: {
    title: "deen.page — Muslim Builders & Islamic Projects",
    description:
      "Discover Muslim developers, founders, and indie hackers building islamic technology. The curated directory of Muslim Builders & Islamic Projects for the Ummah.",
    url: "https://deen.page",
    siteName: "deen.page",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "deen.page — Muslim Builders & Islamic Projects" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "deen.page — Muslim Builders & Islamic Projects",
    description:
      "Discover Muslim developers, founders, and indie hackers building islamic technology. The curated directory of Muslim Builders & Islamic Projects for the Ummah.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="deen" className="overflow-x-hidden" style={{ colorScheme: "dark" }}>
      <head>
        <Script
          defer
          data-website-id="dfid_CB9U6JtJTDb4hJg3Uw1de"
          data-domain="deen.page"
          src="https://datafa.st/js/script.js"
        ></Script>
      </head>
      <body
        className={`${playfair.variable} ${manrope.variable} font-sans antialiased bg-base-100 text-base-content min-h-screen flex flex-col selection:bg-primary selection:text-primary-content overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
