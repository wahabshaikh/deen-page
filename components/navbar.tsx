"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { upgradeTwitterProfileImage } from "@/lib/url";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`navbar sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base-100/80 backdrop-blur-xl border-b border-base-300 py-2 shadow-lg"
          : "bg-transparent py-4 border-b border-transparent"
      }`}
    >
      <div className="navbar-start px-4 md:px-6">
        {/* Mobile menu toggle */}
        <button
          className="btn btn-ghost btn-circle lg:hidden hover:bg-white/5 text-base-content/70 hover:text-primary transition-colors focus-ring rounded-full focus:outline-none touch-manipulation"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          href="/"
          className="btn btn-ghost hover:bg-transparent inline-block"
        >
          <p className="text-3xl font-display tracking-tight">
            <span className="gradient-text-gold font-medium">deen</span>
            <span className="text-primary/50 mx-0.5">.</span>
            <span className="opacity-80 font-sans text-2xl font-light tracking-wide">page</span>
          </p>
        </Link>
      </div>

      {/* Desktop nav */}
      <div className="navbar-center hidden lg:flex">
        <ul className="flex items-center gap-8 px-1 text-sm font-medium tracking-wider uppercase">
          <li>
            <Link href="/" className="text-base-content/70 hover:text-primary transition-colors hover:glow focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
              Home
            </Link>
          </li>
          <li>
            <Link href="/browse" className="text-base-content/70 hover:text-primary transition-colors hover:glow focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
              Browse
            </Link>
          </li>
          <li>
            <Link href="/projects" className="text-base-content/70 hover:text-primary transition-colors hover:glow focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/builders" className="text-base-content/70 hover:text-primary transition-colors hover:glow focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
              Builders
            </Link>
          </li>
          <li>
            <Link href="/jobs" className="text-base-content/70 hover:text-primary transition-colors hover:glow focus-ring rounded px-2 py-1 focus:outline-none touch-manipulation">
              Jobs
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end px-4 md:px-6 gap-3">
        {session ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-primary/50 transition-[box-shadow,ring-color] focus-ring focus:outline-none touch-manipulation"
            >
              <div className="w-9 rounded-full ring-1 ring-white/10 ring-offset-base-100 ring-offset-2">
                {session.user.image ? (
                  <img
                    alt={session.user.name}
                    src={upgradeTwitterProfileImage(session.user.image) ?? session.user.image}
                  />
                ) : (
                  <div className="bg-primary/10 text-primary flex items-center justify-center w-full h-full text-sm font-bold font-display">
                    {session.user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content glass-card rounded-xl z-10 mt-4 w-56 p-3 shadow-2xl border border-white/10"
            >
              <div className="px-4 py-3 mb-2 border-b border-white/5">
                <p className="text-xs text-base-content/50 uppercase tracking-wider mb-1">Signed in as</p>
                <p className="font-medium truncate">{session.user.name}</p>
              </div>
              <li>
                <Link href="/dashboard" className="gap-3 py-3 rounded-lg hover:bg-white/5 hover:text-primary transition-colors">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              </li>
              <li className="mt-1">
                <button
                  onClick={() => signOut()}
                  className="gap-3 py-3 rounded-lg hover:bg-error/10 hover:text-error transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link
            href="/signin"
            className="btn btn-outline border-white/10 hover:border-primary hover:bg-primary/10 hover:text-primary rounded-full px-6 font-medium tracking-wide transition-[border-color,background-color,color] duration-300 focus-ring focus:outline-none touch-manipulation"
          >
            <User size={16} className="mr-2" />
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 glass-card border-b border-white/5 lg:hidden animate-fade-in-up py-4 px-6 shadow-2xl">
          <ul className="flex flex-col gap-4 text-sm font-medium tracking-widest uppercase">
            <li>
              <Link href="/" onClick={() => setMobileOpen(false)} className="block py-2 text-base-content/70 hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/browse" onClick={() => setMobileOpen(false)} className="block py-2 text-base-content/70 hover:text-primary">
                Browse
              </Link>
            </li>
            <li>
              <Link href="/projects" onClick={() => setMobileOpen(false)} className="block py-2 text-base-content/70 hover:text-primary">
                Projects
              </Link>
            </li>
            <li>
              <Link href="/builders" onClick={() => setMobileOpen(false)} className="block py-2 text-base-content/70 hover:text-primary">
                Builders
              </Link>
            </li>
            <li>
              <Link href="/jobs" onClick={() => setMobileOpen(false)} className="block py-2 text-base-content/70 hover:text-primary">
                Jobs
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
