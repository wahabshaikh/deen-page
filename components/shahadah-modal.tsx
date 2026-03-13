"use client";

import { useState } from "react";
import { BadgeCheck, Loader2, X } from "lucide-react";
import {
  SHAHADAH_OPTIONS,
  type ShahadahLanguage,
  normalizeShahadahText,
} from "@/lib/shahadah";

interface ShahadahModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  showToast: (message: string, tone?: "success" | "error") => void;
}

export function ShahadahModal({
  open,
  onClose,
  onVerified,
  showToast,
}: ShahadahModalProps) {
  const [language, setLanguage] = useState<ShahadahLanguage>("english");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selected =
    SHAHADAH_OPTIONS.find((o) => o.value === language) ?? SHAHADAH_OPTIONS[0];
  const matches =
    normalizeShahadahText(response) === normalizeShahadahText(selected.phrase);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/builders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, responseText: response }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to create your builder profile.");
        return;
      }

      setResponse("");
      showToast(data.message || "Verified builder profile created.", "success");
      onVerified();
    } catch {
      setError("Unable to create your builder profile.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      style={{ overscrollBehavior: "contain" }}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[28px] bg-stone-50 text-stone-900 shadow-[0_35px_120px_rgba(0,0,0,0.45)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shahadah-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-stone-300 p-2 text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-900"
          aria-label="Close shahadah modal"
        >
          <X size={18} />
        </button>

        <div className="border-b border-stone-200 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_40%),linear-gradient(180deg,#fffdf8,#f6f1e8)] px-8 py-7">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900">
            <BadgeCheck size={14} />
            Shahadah Gate
          </p>
          <h2
            id="shahadah-modal-title"
            className="text-3xl font-display font-medium"
          >
            Recite the shahadah to activate your builder profile
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600">
            Type the shahadah exactly as shown in one language of your choice.
            When it matches, we will create your verified builder profile
            immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="shahadah-language"
              className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500"
            >
              Language
            </label>
            <select
              id="shahadah-language"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as ShahadahLanguage);
                setResponse("");
                setError("");
              }}
              className="select w-full rounded-2xl border-stone-200 bg-white text-base"
            >
              {SHAHADAH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              {selected.label}
            </span>
            <div className="rounded-3xl border border-stone-200 bg-stone-100 px-5 py-5 text-lg leading-relaxed text-stone-700">
              {selected.phrase}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="shahadah-response"
              className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500"
            >
              Type It Back
            </label>
            <textarea
              id="shahadah-response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={`Type the shahadah in ${selected.label}\u2026`}
              className="textarea min-h-32 w-full rounded-3xl border-stone-200 bg-white text-base"
              required
            />
            <p className="text-sm text-stone-500">
              The button unlocks when your response matches the displayed
              shahadah exactly.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-stone-500">
              {matches
                ? "Shahadah matched. Your verified builder profile is ready."
                : "Match the shahadah text to continue."}
            </div>
            <button
              type="submit"
              disabled={!matches || submitting}
              className="btn rounded-full border-none bg-stone-900 px-7 text-stone-50 hover:bg-stone-800 disabled:bg-stone-300 disabled:text-stone-500"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Take Shahadah & Create Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
