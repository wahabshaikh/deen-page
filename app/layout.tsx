import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "deen.page — Muslim Builders & Islamic Projects",
    description:
      "Discover Muslim developers, founders, and indie hackers building islamic technology. The curated directory of Muslim Builders & Islamic Projects for the Ummah.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="deen" className="overflow-x-hidden">
      <body
        className={`${playfair.variable} ${manrope.variable} font-sans antialiased bg-base-100 text-base-content min-h-screen flex flex-col selection:bg-primary selection:text-primary-content overflow-x-hidden`}
      >
        {/* Subtle noise texture overlay */}
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        ></div>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <a
          href="https://wahabshaikh.com"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-primary/30 hover:bg-white/[0.06] transition-all duration-300 group"
          aria-label="By Wahab Shaikh on X"
        >
          <img
            src="https://wahabshaikh.com/favicon.ico"
            alt=""
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-base-content/70 group-hover:text-primary transition-colors">
            by Wahab Shaikh
          </span>
        </a>
      </body>
    </html>
  );
}
