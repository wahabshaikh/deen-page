"use client";

import { useState, useRef, useEffect } from "react";
import { LoaderIcon, GlobeIconComponent, CheckCircleIcon, PlusIcon } from "@/components/icons";

type Step = "urls" | "details" | "success";

export function SubmitJobModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>("urls");
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyUrl, setCompanyUrl] = useState("");
  const [listingUrl, setListingUrl] = useState("");

  const [form, setForm] = useState({
    companyName: "",
    companyUrl: "",
    companyFavicon: "",
    companyDescription: "",
    listingUrl: "",
  });

  function reset() {
    setStep("urls");
    setError(null);
    setCompanyUrl("");
    setListingUrl("");
    setForm({
      companyName: "",
      companyUrl: "",
      companyFavicon: "",
      companyDescription: "",
      listingUrl: "",
    });
  }

  function openModal() {
    reset();
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => reset();
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  async function fetchMetadata(url: string) {
    const res = await fetch(
      `/api/projects/metadata?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) return null;
    return res.json();
  }

  async function handleFetchDetails(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFetching(true);

    try {
      let normalizedCompanyUrl = companyUrl.trim();
      if (!/^https?:\/\//i.test(normalizedCompanyUrl)) {
        normalizedCompanyUrl = `https://${normalizedCompanyUrl}`;
      }
      let normalizedListingUrl = listingUrl.trim();
      if (!/^https?:\/\//i.test(normalizedListingUrl)) {
        normalizedListingUrl = `https://${normalizedListingUrl}`;
      }

      let companyNameFallback: string;
      try {
        companyNameFallback = new URL(normalizedCompanyUrl).hostname;
      } catch {
        companyNameFallback = normalizedCompanyUrl;
      }

      const companyMeta = await fetchMetadata(normalizedCompanyUrl);

      setForm({
        companyName: companyMeta?.title ?? companyNameFallback,
        companyUrl: normalizedCompanyUrl,
        companyFavicon: companyMeta?.favicon ?? "",
        companyDescription: companyMeta?.description ?? "",
        listingUrl: normalizedListingUrl,
      });

      setStep("details");
    } catch {
      setError("Failed to fetch company details. Please check the URL and try again.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit listing");
        return;
      }

      setStep("success");
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    setError(null);
    setStep("urls");
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="btn btn-primary rounded-full px-6 gap-2 font-medium tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-[transform,box-shadow] duration-300 focus-ring focus:outline-none touch-manipulation"
      >
        <PlusIcon size={18} />
        Submit a Job
      </button>

      <dialog
        ref={dialogRef}
        className="modal"
        aria-labelledby="submit-job-modal-title"
        aria-modal="true"
      >
        <div className="modal-box max-w-lg max-h-[90vh] overflow-y-auto">
          <h3
            id="submit-job-modal-title"
            className="font-display text-xl font-medium mb-4"
          >
            {step === "success" ? "Listing Submitted" : "Submit a Job Listing"}
          </h3>

          {error && (
            <div className="alert alert-error text-sm mb-4" role="alert">
              {error}
            </div>
          )}

          {step === "urls" && (
            <form onSubmit={handleFetchDetails} className="space-y-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Enter URLs</legend>
                <p className="label text-base-content/70 mb-3">
                  Company website and careers/jobs page. We&apos;ll pull company
                  info from the website only.
                </p>
                <div className="form-control">
                  <label className="label py-1" htmlFor="job-company-url">
                    <span className="label-text">Company Website URL</span>
                  </label>
                  <input
                    id="job-company-url"
                    type="text"
                    placeholder="e.g. tarteel.ai"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1" htmlFor="job-listing-url">
                    <span className="label-text">Jobs / Careers Page URL</span>
                  </label>
                  <input
                    id="job-listing-url"
                    type="text"
                    placeholder="e.g. t.zip/careers"
                    value={listingUrl}
                    onChange={(e) => setListingUrl(e.target.value)}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="modal-action justify-start pt-2 flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={
                      !companyUrl.trim() || !listingUrl.trim() || fetching
                    }
                    className="btn btn-primary gap-2"
                  >
                    {fetching ? (
                      <LoaderIcon size={16} className="animate-spin" />
                    ) : (
                      <GlobeIconComponent size={16} />
                    )}
                    Fetch company info
                  </button>
                  <button type="button" onClick={closeModal} className="btn btn-ghost">
                    Cancel
                  </button>
                </div>
              </fieldset>
            </form>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="label text-base-content/70">
                Review and edit company details. The jobs link is the URL you entered.
              </p>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200 border border-base-300">
                {form.companyFavicon ? (
                  <img
                    src={form.companyFavicon}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center shrink-0">
                    <GlobeIconComponent size={20} className="text-base-content/40" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {form.companyName || "Company"}
                  </p>
                  <p className="text-xs text-base-content/50 truncate">
                    {form.companyUrl}
                  </p>
                </div>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Company details</legend>
                <div className="flex flex-col gap-3">
                  <div className="form-control">
                    <label className="label py-1" htmlFor="job-company-name">
                      <span className="label-text">Company Name</span>
                    </label>
                    <input
                      id="job-company-name"
                      type="text"
                      value={form.companyName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, companyName: e.target.value }))
                      }
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1" htmlFor="job-company-desc">
                      <span className="label-text">Company description (optional)</span>
                    </label>
                    <textarea
                      id="job-company-desc"
                      value={form.companyDescription}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          companyDescription: e.target.value,
                        }))
                      }
                      className="textarea textarea-bordered w-full"
                      rows={3}
                      placeholder="Short description from the company site"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="text-sm text-base-content/60">
                <span className="font-medium">Jobs page:</span>{" "}
                <a
                  href={form.listingUrl}
                  target="_blank"
                  rel="noopener"
                  className="link link-hover break-all"
                >
                  {form.listingUrl}
                </a>
              </div>

              <div className="modal-action justify-start pt-2 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="btn btn-ghost"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary gap-2"
                >
                  {submitting ? (
                    <LoaderIcon size={16} className="animate-spin" />
                  ) : (
                    <PlusIcon size={16} />
                  )}
                  Submit for Review
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <CheckCircleIcon
                size={48}
                className="text-success mx-auto mb-4"
                aria-hidden
              />
              <h4 className="text-lg font-display font-medium mb-2">
                Thank you!
              </h4>
              <p className="text-base-content/70 mb-6">
                The company listing has been submitted for review. It will
                appear on the jobs page once approved.
              </p>
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit" className="size-full min-h-screen cursor-default" aria-label="Close modal" />
        </form>
      </dialog>
    </>
  );
}
