import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-base-100 border-t border-base-300 relative overflow-hidden mt-24">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center text-center relative z-10">
        <aside className="mb-12">
          <Link href="/" className="inline-block mb-6">
            <p className="text-3xl font-display tracking-tight">
              <span className="gradient-text-gold font-medium">deen</span>
              <span className="text-primary/50 mx-0.5">.</span>
              <span className="opacity-80 font-sans text-2xl font-light tracking-wide">page</span>
            </p>
          </Link>
          <p className="text-base font-light text-base-content/80 max-w-md mx-auto leading-relaxed">
            The curated directory of Muslim Builders & Islamic Projects.
            Discover, connect, and support builders of the Ummah.
          </p>
        </aside>
        
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium tracking-widest uppercase mb-8">
          <Link href="/" className="text-base-content/75 hover:text-primary transition-colors focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
            Home
          </Link>
          <Link href="/projects" className="text-base-content/75 hover:text-primary transition-colors focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
            Projects
          </Link>
          <Link href="/builders" className="text-base-content/75 hover:text-primary transition-colors focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
            Builders
          </Link>
          <Link href="/join" className="text-base-content/75 hover:text-primary transition-colors focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
            Join
          </Link>
        </nav>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-medium tracking-wider uppercase text-base-content/50 mb-12">
          <Link href="/privacy-policy" className="hover:text-primary transition-colors focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-primary transition-colors focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
            Terms of Service
          </Link>
        </nav>
        
        <aside className="pt-8 border-t border-base-300 w-full flex justify-center">
          <p className="text-sm font-medium text-base-content/60 flex items-center gap-2">
            Built with <Heart size={14} className="text-error/80 fill-error/20" /> for the Ummah
          </p>
        </aside>
      </div>
    </footer>
  );
}
