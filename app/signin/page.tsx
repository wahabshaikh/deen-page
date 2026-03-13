"use client";

import { useSession, signIn } from "@/lib/auth-client";
import { LogIn, Loader2, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";

function SignInContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

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
          <User size={36} className="text-primary -rotate-3" />
        </div>
        <h1 className="text-4xl font-display font-medium mb-4">Sign In</h1>
        <p className="text-lg font-light opacity-70">
          Sign in or create an account to access your dashboard and complete the
          shahadah onboarding flow.
        </p>
      </div>

      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden animate-fade-in-up delay-200">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
        <div className="p-8 md:p-10 text-center">
          <p className="mb-8 opacity-70 font-light">
            Authenticate using your X account to create your verified builder
            profile.
          </p>
          <button
            onClick={() =>
              signIn.social({
                provider: "twitter",
                callbackURL: callbackUrl,
              })
            }
            className="btn btn-primary rounded-full px-8 py-3 h-auto w-full gap-3 font-medium tracking-wide transition-all"
          >
            <LogIn size={18} />
            Continue with X
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
