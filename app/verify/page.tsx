"use client";

import { useSession, signIn } from "@/lib/auth-client";
import { BadgeCheck, LogIn, Loader2 } from "lucide-react";
import { useState } from "react";

export default function VerifyPage() {
  const { data: session, isPending } = useSession();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleVerify() {
    if (!session) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/builders/verify", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(
          data.message || "Profile verified! You now have full editing access."
        );
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
      
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 transform rotate-3">
          <BadgeCheck size={36} className="text-primary -rotate-3" />
        </div>
        <h1 className="text-4xl font-display font-medium mb-4">Verify Your Profile</h1>
        <p className="text-lg font-light opacity-70">
          If you&apos;ve been indexed in the directory, verify ownership by
          signing in with your X (Twitter) account.
        </p>
      </div>

      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden animate-fade-in-up delay-200">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
        <div className="p-8 md:p-10">
          {!session ? (
            <div className="text-center">
              <p className="mb-8 opacity-70 font-light">
                Sign in with your X account to match your profile.
              </p>
              <button
                onClick={() =>
                  signIn.social({
                    provider: "twitter",
                    callbackURL: "/verify",
                  })
                }
                className="btn btn-outline border-white/10 hover:border-primary hover:bg-primary/10 hover:text-primary rounded-full px-8 py-3 h-auto w-full gap-3 font-medium tracking-wide transition-all"
              >
                <LogIn size={18} />
                Sign in with X
              </button>
            </div>
          ) : status === "success" ? (
            <div className="text-center">
              <div className="text-success text-xl font-medium mb-4 font-display">
                ✓ Verified!
              </div>
              <p className="opacity-70 mb-8 font-light">{message}</p>
              <a href="/dashboard" className="btn btn-primary rounded-full px-8 w-full font-medium tracking-wide">
                Go to Dashboard
              </a>
            </div>
          ) : status === "error" ? (
            <div className="text-center">
              <div className="text-error text-xl font-medium mb-4 font-display">
                Verification Failed
              </div>
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error mb-8 text-sm text-center">
                {message}
              </div>
              <button
                onClick={handleVerify}
                className="btn btn-outline border-white/10 hover:border-white/30 rounded-full px-8 w-full font-medium tracking-wide"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center gap-3 justify-center mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{session.user.name[0]}</div>
                )}
                <p className="text-sm font-light">
                  Signed in as <strong className="font-medium">{session.user.name}</strong>
                </p>
              </div>
              <p className="text-sm font-light opacity-60 mb-8">
                We&apos;ll match your X handle to an indexed profile.
              </p>
              <button
                onClick={handleVerify}
                disabled={status === "loading"}
                className="btn btn-primary w-full rounded-full gap-2 h-12 text-base font-medium tracking-wide"
              >
                {status === "loading" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <BadgeCheck size={18} />
                )}
                Verify My Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
