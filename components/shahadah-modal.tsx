"use client";

import { useState } from "react";
import { BadgeCheckIcon, LoaderIcon, CancelIcon } from "@/components/icons";
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
        className="modal-box relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shahadah-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
          aria-label="Close shahadah modal"
        >
          <CancelIcon size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="badge badge-primary gap-1">
            <BadgeCheckIcon size={14} />
            Shahadah Gate
          </span>
        </div>
        <h2
          id="shahadah-modal-title"
          className="font-display text-2xl font-medium mb-2"
        >
          Recite the shahadah to activate your builder profile
        </h2>
        <p className="text-base-content/70 mb-6 max-w-xl">
          Type the shahadah exactly as shown in one language of your choice.
          When it matches, we will create your verified builder profile immediately.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="alert alert-error text-sm">
              {error}
            </div>
          )}

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Language</legend>
            <div className="form-control">
              <label className="label py-1" htmlFor="shahadah-language">
                <span className="label-text">Choose language</span>
              </label>
              <select
                id="shahadah-language"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as ShahadahLanguage);
                  setResponse("");
                  setError("");
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
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">{selected.label}</legend>
            <div className="rounded-xl bg-base-200 border border-base-300 px-4 py-4 text-base leading-relaxed">
              {selected.phrase}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Type it back</legend>
            <div className="form-control">
              <label className="label py-1" htmlFor="shahadah-response">
                <span className="label-text">Your response</span>
              </label>
              <textarea
                id="shahadah-response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder={`Type the shahadah in ${selected.label}\u2026`}
                className="textarea textarea-bordered w-full min-h-32"
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  The button unlocks when your response matches exactly.
                </span>
              </label>
            </div>
          </fieldset>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-sm text-base-content/60">
              {matches
                ? "Shahadah matched. Your verified builder profile is ready."
                : "Match the shahadah text to continue."}
            </p>
            <button
              type="submit"
              disabled={!matches || submitting}
              className="btn btn-primary gap-2"
            >
              {submitting ? (
                <LoaderIcon size={16} className="animate-spin" />
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
