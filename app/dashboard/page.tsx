"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession, signIn } from "@/lib/auth-client";
import {
  BadgeCheck,
  ExternalLink,
  FolderPlus,
  Loader2,
  LogIn,
  Pencil,
  Save,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  STATUS_TAGS,
  type Category,
} from "@/lib/constants";
import {
  SHAHADAH_OPTIONS,
  type ShahadahLanguage,
  normalizeShahadahText,
} from "@/lib/shahadah";

interface BuilderProfile {
  _id: string;
  name: string;
  xHandle: string;
  avatar?: string;
  country?: string;
  stack: string[];
  githubUrl?: string;
  websiteUrl?: string;
  statusTags: string[];
  supportLink?: string;
  status: string;
  slug: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  slug: string;
  categories: string[];
  url: string;
  favicon?: string;
  githubUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  chromeStoreUrl?: string;
}

interface ToastState {
  message: string;
  tone: "success" | "error";
}

function createEmptyProject() {
  return {
    title: "",
    description: "",
    url: "",
    favicon: "",
    categories: [] as string[],
    githubUrl: "",
    appStoreUrl: "",
    playStoreUrl: "",
    chromeStoreUrl: "",
  };
}

function buildProfileForm(builder: BuilderProfile) {
  return {
    name: builder.name || "",
    country: builder.country || "",
    stack: (builder.stack || []).join(", "),
    githubUrl: builder.githubUrl || "",
    websiteUrl: builder.websiteUrl || "",
    supportLink: builder.supportLink || "",
    statusTags: builder.statusTags || [],
  };
}

function normalizeExternalUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [builder, setBuilder] = useState<BuilderProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "projects">(
    "profile",
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  const [showShahadahModal, setShowShahadahModal] = useState(false);
  const [shahadahLanguage, setShahadahLanguage] =
    useState<ShahadahLanguage>("english");
  const [shahadahResponse, setShahadahResponse] = useState("");
  const [shahadahError, setShahadahError] = useState("");
  const [takingShahadah, setTakingShahadah] = useState(false);

  const [showNewProject, setShowNewProject] = useState(false);
  const [addProjectStep, setAddProjectStep] = useState<"url" | "details">(
    "url",
  );
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [newProject, setNewProject] = useState(createEmptyProject);
  const [newProjectKeywordMatches, setNewProjectKeywordMatches] = useState<
    string[]
  >([]);

  const [editingProjectSlug, setEditingProjectSlug] = useState<string | null>(
    null,
  );
  const [editProject, setEditProject] = useState(createEmptyProject);

  const [form, setForm] = useState({
    name: "",
    country: "",
    stack: "",
    githubUrl: "",
    websiteUrl: "",
    supportLink: "",
    statusTags: [] as string[],
  });

  const showToast = useCallback(
    (message: string, tone: ToastState["tone"] = "error") => {
      setToast({ message, tone });
    },
    [],
  );

  const hydrateBuilder = useCallback((profile: BuilderProfile) => {
    setBuilder(profile);
    setForm(buildProfileForm(profile));
  }, []);

  const resetNewProject = useCallback(() => {
    setShowNewProject(false);
    setAddProjectStep("url");
    setNewProject(createEmptyProject());
    setNewProjectKeywordMatches([]);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");

      if (res.status === 404) {
        setBuilder(null);
        setProjects([]);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await res.json();
      hydrateBuilder(data.builder);
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [hydrateBuilder]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!session) {
      setBuilder(null);
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchData();
  }, [session, fetchData]);

  useEffect(() => {
    if (session && !loading && !builder) {
      setShowShahadahModal(true);
    }

    if (builder) {
      setShowShahadahModal(false);
      setShahadahError("");
      setShahadahResponse("");
    }
  }, [session, loading, builder]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          stack: form.stack
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to save profile.");
        return;
      }

      hydrateBuilder(data.builder);
      showToast("Profile saved.", "success");
    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFetchMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!newProject.url.trim()) return;

    const normalizedUrl = normalizeExternalUrl(newProject.url);
    setFetchingMetadata(true);

    try {
      const res = await fetch(
        `/api/projects/metadata?url=${encodeURIComponent(normalizedUrl)}`,
      );
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to fetch project details.");
        return;
      }

      if (!data.matchesIslamicKeywords) {
        showToast("Project cant be added, contact support.");
        return;
      }

      setNewProject((project) => ({
        ...project,
        url: normalizedUrl,
        title: data.title || project.title,
        description: data.description || project.description,
        favicon: data.favicon || project.favicon,
      }));
      setNewProjectKeywordMatches(data.matchedKeywords || []);
      setAddProjectStep("details");
    } catch (err) {
      console.error("Fetch metadata failed:", err);
      showToast("Failed to fetch project details.");
    } finally {
      setFetchingMetadata(false);
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to add project.");
        return;
      }

      resetNewProject();
      await fetchData();
      showToast("Project added.", "success");
    } catch (err) {
      console.error("Add project failed:", err);
      showToast("Failed to add project.");
    }
  }

  async function handleTakeShahadah(e: React.FormEvent) {
    e.preventDefault();
    setTakingShahadah(true);
    setShahadahError("");

    try {
      const res = await fetch("/api/builders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: shahadahLanguage,
          responseText: shahadahResponse,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setShahadahError(data.error || "Unable to create your builder profile.");
        return;
      }

      hydrateBuilder(data.builder);
      await fetchData();
      setShowShahadahModal(false);
      setShahadahResponse("");
      showToast(data.message || "Verified builder profile created.", "success");
    } catch (err) {
      console.error("Shahadah flow failed:", err);
      setShahadahError("Unable to create your builder profile.");
    } finally {
      setTakingShahadah(false);
    }
  }

  function startEditing(project: Project) {
    setEditingProjectSlug(project.slug);
    setEditProject({
      title: project.title,
      description: project.description,
      url: project.url,
      favicon: project.favicon || "",
      categories: project.categories || [],
      githubUrl: project.githubUrl || "",
      appStoreUrl: project.appStoreUrl || "",
      playStoreUrl: project.playStoreUrl || "",
      chromeStoreUrl: project.chromeStoreUrl || "",
    });
  }

  async function handleDeleteProject(slug: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/dashboard/projects/${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to delete project.");
        return;
      }

      setEditingProjectSlug(null);
      await fetchData();
      showToast("Project deleted.", "success");
    } catch (err) {
      console.error("Delete project failed:", err);
      showToast("Failed to delete project.");
    }
  }

  function toggleProjectCategory<T extends { categories: string[] }>(
    cat: string,
    setter: React.Dispatch<React.SetStateAction<T>>,
    getter: T,
  ) {
    const next = getter.categories.includes(cat)
      ? getter.categories.filter((value) => value !== cat)
      : [...getter.categories, cat];
    setter((prev) => ({ ...prev, categories: next } as T));
  }

  function cancelEditing() {
    setEditingProjectSlug(null);
  }

  async function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProjectSlug) return;

    try {
      const res = await fetch(`/api/dashboard/projects/${editingProjectSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProject),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to update project.");
        return;
      }

      setEditingProjectSlug(null);
      await fetchData();
      showToast("Project updated.", "success");
    } catch (err) {
      console.error("Update project failed:", err);
      showToast("Failed to update project.");
    }
  }

  function toggleStatusTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      statusTags: prev.statusTags.includes(tag)
        ? prev.statusTags.filter((value) => value !== tag)
        : [...prev.statusTags, tag],
    }));
  }

  const selectedShahadah =
    SHAHADAH_OPTIONS.find((option) => option.value === shahadahLanguage) ||
    SHAHADAH_OPTIONS[0];
  const shahadahMatches =
    normalizeShahadahText(shahadahResponse) ===
    normalizeShahadahText(selectedShahadah.phrase);

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <User size={48} className="mx-auto mb-4 text-primary" />
        <h1 className="mb-3 text-3xl font-bold">Builder Dashboard</h1>
        <p className="mb-6 opacity-70">
          Sign in to take the shahadah, create your verified builder profile,
          and manage your projects.
        </p>
        <button
          onClick={() =>
            signIn.social({ provider: "twitter", callbackURL: "/dashboard" })
          }
          className="btn btn-primary gap-2"
        >
          <LogIn size={16} />
          Sign in with X
        </button>
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="relative mx-auto max-w-5xl px-4 py-14">
        {toast && (
          <div className="fixed right-4 top-20 z-50">
            <div
              role="status"
              className={`min-w-72 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${
                toast.tone === "success"
                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
                  : "border-rose-500/30 bg-rose-500/15 text-rose-100"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_32%),linear-gradient(145deg,rgba(19,28,24,0.96),rgba(11,17,15,0.96))] p-8 shadow-2xl shadow-black/30 md:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.04),transparent)]" />
          <div className="relative max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              <Sparkles size={14} />
              Builder Onboarding
            </p>
            <h1 className="mb-5 text-4xl font-display font-medium text-balance md:text-5xl">
              Take the shahadah to unlock your verified builder profile.
            </h1>
            <p className="mb-8 max-w-xl text-lg font-light leading-relaxed text-base-content/75">
              Once you complete the oath, deen.page will create or claim your
              verified builder profile and open the dashboard for project
              management.
            </p>

            <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-base-content/45">
                Signed in as
              </p>
              <p className="mt-2 text-xl font-medium">{session.user.name}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowShahadahModal(true)}
                className="btn btn-primary rounded-full px-7"
              >
                Open Shahadah
              </button>
              <Link
                href="/builders"
                className="btn btn-outline rounded-full border-white/10 px-7"
              >
                Browse Builders
              </Link>
            </div>
          </div>
        </div>

        {showShahadahModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] bg-stone-50 text-stone-900 shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
              <button
                type="button"
                onClick={() => setShowShahadahModal(false)}
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
                <h2 className="text-3xl font-display font-medium">
                  Recite the shahadah to activate your builder profile
                </h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600">
                  Type the shahadah exactly as shown in one language of your
                  choice. When it matches, we will create your verified builder
                  profile immediately.
                </p>
              </div>

              <form onSubmit={handleTakeShahadah} className="space-y-6 px-8 py-8">
                {shahadahError && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  >
                    {shahadahError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Language
                  </label>
                  <select
                    value={shahadahLanguage}
                    onChange={(event) => {
                      setShahadahLanguage(event.target.value as ShahadahLanguage);
                      setShahadahResponse("");
                      setShahadahError("");
                    }}
                    className="select w-full rounded-2xl border-stone-200 bg-white text-base"
                  >
                    {SHAHADAH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    {selectedShahadah.label}
                  </label>
                  <div className="rounded-3xl border border-stone-200 bg-stone-100 px-5 py-5 text-lg leading-relaxed text-stone-700">
                    {selectedShahadah.phrase}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Type It Back
                  </label>
                  <textarea
                    value={shahadahResponse}
                    onChange={(event) => setShahadahResponse(event.target.value)}
                    placeholder={`Type the shahadah in ${selectedShahadah.label}...`}
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
                    {shahadahMatches
                      ? "Shahadah matched. Your verified builder profile is ready."
                      : "Match the shahadah text to continue."}
                  </div>
                  <button
                    type="submit"
                    disabled={!shahadahMatches || takingShahadah}
                    className="btn rounded-full border-none bg-stone-900 px-7 text-stone-50 hover:bg-stone-800 disabled:bg-stone-300 disabled:text-stone-500"
                  >
                    {takingShahadah ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Take Shahadah & Create Profile"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div
            role="status"
            className={`min-w-72 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${
              toast.tone === "success"
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
                : "border-rose-500/30 bg-rose-500/15 text-rose-100"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <BadgeCheck size={14} />
            Verified Builder
          </div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 opacity-60">
            Manage your profile and add Islamic projects that fit the directory.
          </p>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-bordered mb-8">
        <button
          role="tab"
          className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "projects" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          Projects ({projects.length})
        </button>
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Country</span>
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, country: event.target.value }))
              }
              className="input input-bordered"
              placeholder="e.g. United Arab Emirates"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Stack (comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.stack}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, stack: event.target.value }))
              }
              className="input input-bordered"
              placeholder="e.g. Next.js, React Native, Python"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">GitHub URL</span>
            </label>
            <input
              type="url"
              value={form.githubUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, githubUrl: event.target.value }))
              }
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Website URL</span>
            </label>
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, websiteUrl: event.target.value }))
              }
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Support Link</span>
            </label>
            <input
              type="url"
              value={form.supportLink}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, supportLink: event.target.value }))
              }
              className="input input-bordered"
              placeholder="Buy Me a Coffee, Stripe, etc."
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Status Tags</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleStatusTag(tag)}
                  className={`badge badge-lg cursor-pointer transition-all ${
                    form.statusTags.includes(tag)
                      ? "badge-primary"
                      : "badge-outline"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary gap-2">
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Profile
          </button>
        </form>
      )}

      {activeTab === "projects" && (
        <div className="animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <p className="opacity-50">{projects.length} project(s)</p>
            <button
              onClick={() => setShowNewProject((value) => !value)}
              className="btn btn-primary btn-sm gap-2"
            >
              <FolderPlus size={16} />
              Add Project
            </button>
          </div>

          {showNewProject && (
            <div className="card mb-6 border border-base-300 bg-base-200">
              <div className="card-body space-y-3">
                <h3 className="font-semibold">Add Project</h3>
                {addProjectStep === "url" ? (
                  <form onSubmit={handleFetchMetadata} className="space-y-3">
                    <p className="text-sm opacity-60">
                      Start with the project URL. We&apos;ll fetch the title and
                      description first, then check them against the Islamic
                      keyword list before the project can continue.
                    </p>
                    <input
                      type="url"
                      placeholder="Enter project URL (e.g. https://example.com)"
                      value={newProject.url}
                      onChange={(event) =>
                        setNewProject((project) => ({
                          ...project,
                          url: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm w-full"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={!newProject.url.trim() || fetchingMetadata}
                      >
                        {fetchingMetadata ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Fetch details"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={resetNewProject}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddProject} className="space-y-3">
                    {newProjectKeywordMatches.length > 0 && (
                      <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm">
                        Keyword match passed:{" "}
                        <span className="font-medium">
                          {newProjectKeywordMatches.join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {newProject.favicon && (
                        <img
                          src={newProject.favicon}
                          alt=""
                          className="h-10 w-10 rounded-lg"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Project title"
                        value={newProject.title}
                        onChange={(event) =>
                          setNewProject((project) => ({
                            ...project,
                            title: event.target.value,
                          }))
                        }
                        className="input input-bordered input-sm flex-1"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={newProject.description}
                      onChange={(event) =>
                        setNewProject((project) => ({
                          ...project,
                          description: event.target.value,
                        }))
                      }
                      className="textarea textarea-bordered textarea-sm"
                      rows={3}
                      required
                    />
                    <input
                      type="url"
                      placeholder="Favicon URL (optional)"
                      value={newProject.favicon}
                      onChange={(event) =>
                        setNewProject((project) => ({
                          ...project,
                          favicon: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text">
                          Platforms (select all that apply)
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              toggleProjectCategory(cat, setNewProject, newProject)
                            }
                            className={`badge badge-lg cursor-pointer transition-all ${
                              newProject.categories.includes(cat)
                                ? "badge-primary"
                                : "badge-outline"
                            }`}
                          >
                            {CATEGORY_LABELS[cat as Category]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="GitHub URL (optional)"
                      value={newProject.githubUrl}
                      onChange={(event) =>
                        setNewProject((project) => ({
                          ...project,
                          githubUrl: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="App Store link (optional)"
                      value={newProject.appStoreUrl}
                      onChange={(event) =>
                        setNewProject((project) => ({
                          ...project,
                          appStoreUrl: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="Play Store link (optional)"
                      value={newProject.playStoreUrl}
                      onChange={(event) =>
                        setNewProject((project) => ({
                          ...project,
                          playStoreUrl: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="Chrome Web Store link (optional)"
                      value={newProject.chromeStoreUrl}
                      onChange={(event) =>
                        setNewProject((project) => ({
                          ...project,
                          chromeStoreUrl: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAddProjectStep("url")}
                        className="btn btn-ghost btn-sm"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={!newProject.categories.length}
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={resetNewProject}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project._id}
                className="card border border-base-300 bg-base-200"
              >
                {editingProjectSlug === project.slug ? (
                  <form
                    onSubmit={handleUpdateProject}
                    className="card-body space-y-3"
                  >
                    <h3 className="font-semibold">Edit Project</h3>
                    <div className="flex items-center gap-3">
                      {editProject.favicon && (
                        <img
                          src={editProject.favicon}
                          alt=""
                          className="h-10 w-10 rounded-lg"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Project title"
                        value={editProject.title}
                        onChange={(event) =>
                          setEditProject((projectState) => ({
                            ...projectState,
                            title: event.target.value,
                          }))
                        }
                        className="input input-bordered input-sm flex-1"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={editProject.description}
                      onChange={(event) =>
                        setEditProject((projectState) => ({
                          ...projectState,
                          description: event.target.value,
                        }))
                      }
                      className="textarea textarea-bordered textarea-sm"
                      rows={3}
                      required
                    />
                    <input
                      type="url"
                      placeholder="Project URL"
                      value={editProject.url}
                      onChange={(event) =>
                        setEditProject((projectState) => ({
                          ...projectState,
                          url: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Favicon URL (optional)"
                      value={editProject.favicon}
                      onChange={(event) =>
                        setEditProject((projectState) => ({
                          ...projectState,
                          favicon: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text">
                          Platforms (select all that apply)
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              toggleProjectCategory(cat, setEditProject, editProject)
                            }
                            className={`badge badge-lg cursor-pointer transition-all ${
                              editProject.categories.includes(cat)
                                ? "badge-primary"
                                : "badge-outline"
                            }`}
                          >
                            {CATEGORY_LABELS[cat as Category]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="GitHub URL (optional)"
                      value={editProject.githubUrl}
                      onChange={(event) =>
                        setEditProject((projectState) => ({
                          ...projectState,
                          githubUrl: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="App Store link (optional)"
                      value={editProject.appStoreUrl}
                      onChange={(event) =>
                        setEditProject((projectState) => ({
                          ...projectState,
                          appStoreUrl: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="Play Store link (optional)"
                      value={editProject.playStoreUrl}
                      onChange={(event) =>
                        setEditProject((projectState) => ({
                          ...projectState,
                          playStoreUrl: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="Chrome Web Store link (optional)"
                      value={editProject.chromeStoreUrl}
                      onChange={(event) =>
                        setEditProject((projectState) => ({
                          ...projectState,
                          chromeStoreUrl: event.target.value,
                        }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={!editProject.categories.length}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.slug)}
                        className="btn btn-ghost btn-sm text-error"
                        aria-label="Delete project"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="card-body flex-row items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(project.categories || []).map((cat) => (
                          <span
                            key={cat}
                            className="badge badge-outline badge-sm"
                          >
                            {CATEGORY_LABELS[cat as Category] || cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(project)}
                        className="btn btn-ghost btn-xs gap-1"
                        aria-label="Edit project"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <ExternalLink size={14} />
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.slug)}
                        className="btn btn-ghost btn-xs gap-1 text-error"
                        aria-label="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {projects.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 px-6 py-10 text-center opacity-60">
                Add your first project to appear in the directory.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
