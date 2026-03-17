import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { addRefParam } from "@/lib/url";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
        aria-hidden
      />
      <Navbar />
      <main className="grow">{children}</main>
      <Footer />
      <a
        href={addRefParam("https://wahabshaikh.com")}
        target="_blank"
        rel="noopener"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-base-200/90 border border-base-300 hover:border-primary/30 hover:bg-base-200 transition-[border-color,background-color] duration-300 group focus-ring focus:outline-none touch-manipulation"
        aria-label="By Wahab Shaikh on X"
      >
        <img
          src="https://wahabshaikh.com/favicon.ico"
          alt=""
          width={24}
          height={24}
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-base-content/70 group-hover:text-primary transition-colors">
          by Wahab Shaikh
        </span>
      </a>
    </>
  );
}
