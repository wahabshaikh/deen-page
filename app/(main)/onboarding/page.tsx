"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheckIcon, LoaderIcon } from "@/components/icons";
import {
  SHAHADAH_OPTIONS,
  type ShahadahLanguage,
  normalizeShahadahText,
} from "@/lib/shahadah";
import { COUNTRIES } from "@/lib/countries";
import { normalizeUsername } from "@/lib/slug";
import Link from "next/link";

type OnboardingStatus = "loading" | "has_builder" | "indexed_claim" | "new_onboarding";

interface IndexedBuilder {
  _id: string;
  name: string;
  username: string;
  xHandle: string;
}

const STEP_MAX_W = "max-w-xl";
const TOTAL_STEPS = 3;

function OnboardingCard({
  title,
  currentStep,
  children,
}: {
  title: string;
  currentStep?: number;
  children: React.ReactNode;
}) {
  const progressValue = currentStep != null ? (currentStep / TOTAL_STEPS) * 100 : 0;

  return (
    <div className={`mx-auto ${STEP_MAX_W} px-4 py-12`}>
      {currentStep != null && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-base-content/60 mb-1">
            <span>Step {currentStep} of {TOTAL_STEPS}</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={progressValue}
            max={100}
            aria-label={`Step ${currentStep} of ${TOTAL_STEPS}`}
          />
        </div>
      )}
      <div className="card bg-base-200 border border-base-300 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-semibold text-base-content">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus>("loading");
  const [indexedBuilder, setIndexedBuilder] = useState<IndexedBuilder | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [shahadahLanguage, setShahadahLanguage] = useState<ShahadahLanguage>("english");
  const [shahadahResponse, setShahadahResponse] = useState("");
  const [shahadahError, setShahadahError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [usernameModifiedTo, setUsernameModifiedTo] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/onboarding/status");
    if (!res.ok) {
      setStatus("new_onboarding");
      return;
    }
    const data = await res.json();
    setStatus(data.status);
    if (data.builder) setIndexedBuilder(data.builder);
  }, []);

  useEffect(() => {
    if (!sessionPending && !session) {
      router.replace("/signin?callbackUrl=/onboarding");
      return;
    }
    if (!session) return;
    fetchStatus();
  }, [session, sessionPending, router, fetchStatus]);

  useEffect(() => {
    if (status === "has_builder") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && status === "new_onboarding") {
      const handle = (session.user as { xHandle?: string }).xHandle?.replace(/^@/, "").trim().toLowerCase() || "";
      setUsername(handle);
      setName(session.user.name?.trim() || "");
    }
  }, [session, status]);

  async function handleClaimProfile() {
    setClaiming(true);
    setShahadahError("");
    try {
      const res = await fetch("/api/builders/claim", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setShahadahError(data.error || "Failed to claim profile.");
        return;
      }
      router.replace("/dashboard");
    } catch {
      setShahadahError("Failed to claim profile.");
    } finally {
      setClaiming(false);
    }
  }

  const selectedShahadah =
    SHAHADAH_OPTIONS.find((o) => o.value === shahadahLanguage) ?? SHAHADAH_OPTIONS[0];
  const shahadahMatches =
    normalizeShahadahText(shahadahResponse) === normalizeShahadahText(selectedShahadah.phrase);

  async function handleShahadahSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setShahadahError("");
    try {
      const res = await fetch("/api/builders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: shahadahLanguage,
          responseText: shahadahResponse,
          username: username.trim() || undefined,
          name: name.trim() || undefined,
          country: country.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShahadahError(data.error || "Unable to create your builder profile.");
        return;
      }
      const createdUsername = data.builder?.username;
      const requestedUsername = normalizeUsername(username.trim());
      if (createdUsername && requestedUsername && createdUsername !== requestedUsername) {
        setUsernameModifiedTo(createdUsername);
      } else {
        router.replace("/dashboard");
      }
    } catch {
      setShahadahError("Unable to create your builder profile.");
    } finally {
      setVerifying(false);
    }
  }

  if (sessionPending || status === "loading" || status === "has_builder") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderIcon size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // --- Claim profile ---
  if (status === "indexed_claim" && indexedBuilder) {
    return (
      <OnboardingCard title={`Profile for @${indexedBuilder.xHandle} exists`}>
        {shahadahError && (
          <div role="alert" className="alert alert-error text-sm">
            {shahadahError}
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={handleClaimProfile}
            disabled={claiming}
            className="btn btn-primary gap-2"
          >
            {claiming ? (
              <LoaderIcon size={18} className="animate-spin" />
            ) : (
              <BadgeCheckIcon size={18} />
            )}
            Claim profile
          </button>
          <Link href="/builders" className="btn btn-ghost">
            Browse builders
          </Link>
        </div>
      </OnboardingCard>
    );
  }

  // --- Step 1: Username ---
  if (status === "new_onboarding" && step === 1) {
    return (
      <OnboardingCard title="Username" currentStep={1}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) setStep(2);
          }}
          className="space-y-4 pt-2"
        >
          <label className="input input-bordered flex items-center w-full gap-2">
            <span className="label shrink-0 text-base-content/70">deen.page/</span>
            <input
              id="onboarding-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              className="grow min-w-0 bg-transparent border-none outline-none focus:outline-none"
              autoComplete="username"
            />
          </label>
          <button
            type="submit"
            disabled={!username.trim()}
            className="btn btn-primary"
          >
            Continue
          </button>
        </form>
      </OnboardingCard>
    );
  }

  // --- Step 2: Name & country ---
  if (status === "new_onboarding" && step === 2) {
    return (
      <OnboardingCard title="Name & country" currentStep={2}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) setStep(3);
          }}
          className="space-y-4 pt-2"
        >
          <div className="form-control">
            <label className="label" htmlFor="onboarding-name">
              <span className="label-text">Name</span>
            </label>
            <input
              id="onboarding-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input input-bordered w-full"
              autoComplete="name"
            />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="onboarding-country">
              <span className="label-text">Country</span>
            </label>
            <select
              id="onboarding-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="select select-bordered w-full"
              aria-label="Country"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-ghost"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !country.trim()}
              className="btn btn-primary"
            >
              Continue
            </button>
          </div>
        </form>
      </OnboardingCard>
    );
  }

  // --- Username was taken: show created profile URL ---
  if (usernameModifiedTo) {
    return (
      <OnboardingCard title="Profile created" currentStep={3}>
        <div className="space-y-4 pt-2">
          <div className="alert alert-info text-sm">
            That username was taken. Your profile was created at deen.page/{usernameModifiedTo}
          </div>
          <button
            type="button"
            onClick={() => router.replace("/dashboard")}
            className="btn btn-primary"
          >
            Go to dashboard
          </button>
        </div>
      </OnboardingCard>
    );
  }

  // --- Step 3: Shahadah ---
  return (
    <OnboardingCard title="Shahadah" currentStep={3}>
      <form onSubmit={handleShahadahSubmit} className="space-y-4 pt-2">
        {shahadahError && (
          <div role="alert" className="alert alert-error text-sm">
            {shahadahError}
          </div>
        )}

        <div className="form-control">
          <label className="label" htmlFor="shahadah-language">
            <span className="label-text">Language</span>
          </label>
          <select
            id="shahadah-language"
            value={shahadahLanguage}
            onChange={(e) => {
              setShahadahLanguage(e.target.value as ShahadahLanguage);
              setShahadahResponse("");
              setShahadahError("");
            }}
            className="select select-bordered w-full"
          >
            {SHAHADAH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg bg-base-300 px-4 py-3 text-base-content/90">
          {selectedShahadah.phrase}
        </div>

        <div className="form-control">
          <label className="label" htmlFor="shahadah-response">
            <span className="label-text">Type it below</span>
          </label>
          <textarea
            id="shahadah-response"
            value={shahadahResponse}
            onChange={(e) => setShahadahResponse(e.target.value)}
            placeholder={`In ${selectedShahadah.label}\u2026`}
            className="textarea textarea-bordered w-full min-h-28"
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="btn btn-ghost"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!shahadahMatches || verifying}
            className="btn btn-primary gap-2"
          >
            {verifying ? (
              <LoaderIcon size={16} className="animate-spin" />
            ) : (
              "Create profile"
            )}
          </button>
        </div>
      </form>
    </OnboardingCard>
  );
}
