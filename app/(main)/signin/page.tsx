"use client";

import { useSession, signIn } from "@/lib/auth-client";
import { LoaderIcon } from "@/components/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";

function SignInContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/onboarding";

  useEffect(() => {
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderIcon size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-display font-medium text-center text-base-content mb-2">
          Sign In
        </h1>
        <p className="text-center text-base-content/60 text-sm mb-8">
          Join the directory of Muslim builders and Islamic projects.
        </p>
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body p-6 md:p-8">
            <button
              onClick={() =>
                signIn.social({
                  provider: "twitter",
                  callbackURL: callbackUrl,
                })
              }
              className="btn btn-primary w-full gap-2"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Sign in with X
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoaderIcon size={32} className="animate-spin text-primary" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
