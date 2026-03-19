"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BadgeCheckIcon,
  CheckIcon,
  ClockIcon,
  EyeIconComponent,
  ExternalLinkIcon,
  FolderAddIconComponent,
  GlobeIconComponent,
  LinkIconComponent,
  LoaderIcon,
  PaletteIcon,
  PencilIconComponent,
  PlusIcon,
  SaveIconComponent,
  TrashIcon,
  CancelIcon,
  UserIconComponent,
} from "@/components/icons";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DAISYUI_THEMES,
  STATUS_TAGS,
  type Category,
} from "@/lib/constants";
import { COUNTRIES, getFlagEmoji } from "@/lib/countries";
import { Toast, useToast } from "@/components/toast";

interface BuilderProfile {
  _id: string;
  name: string;
  xHandle: string;
  avatar?: string;
  country?: string;
  websiteUrl?: string;
  statusTags: string[];
  supportLink?: string;
  status: string;
  username: string;
  bio?: string;
  links?: { title: string; url: string }[];
  socialUrls?: { url: string }[];
  theme?: string;
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
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
  isPublic?: boolean;
}

function createEmptyProject() {
  return {
    title: "",
    description: "",
    url: "",
    slug: "",
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
    username: builder.username || "",
    country: builder.country || "",
    websiteUrl: builder.websiteUrl || "",
    supportLink: builder.supportLink || "",
    statusTags: builder.statusTags || [],
    bio: builder.bio || "",
  };
}

function normalizeExternalUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [builder, setBuilder] = useState<BuilderProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "projects">("profile");
  const { toast, showToast, dismissToast } = useToast();

  const [showNewProject, setShowNewProject] = useState(false);
  const [addProjectStep, setAddProjectStep] = useState<"url" | "details">(
    "url",
  );
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [newProject, setNewProject] = useState(createEmptyProject);

  const [editingProjectSlug, setEditingProjectSlug] = useState<string | null>(
    null,
  );
  const [editProject, setEditProject] = useState(createEmptyProject);

  const [form, setForm] = useState({
    name: "",
    username: "",
    country: "",
    websiteUrl: "",
    supportLink: "",
    statusTags: [] as string[],
    bio: "",
    links: [] as { title: string; url: string }[],
    socialUrls: [] as { url: string }[],
    theme: "deen",
  });

  const hydrateBuilder = useCallback((profile: BuilderProfile) => {
    setBuilder(profile);
    setForm({
      name: profile.name || "",
      username: profile.username || "",
      country: profile.country || "",
      websiteUrl: profile.websiteUrl || "",
      supportLink: profile.supportLink || "",
      statusTags: profile.statusTags || [],
      bio: profile.bio || "",
      links: profile.links || [],
      socialUrls: profile.socialUrls || [],
      theme: profile.theme || "deen",
    });
  }, []);

  const resetNewProject = useCallback(() => {
    setShowNewProject(false);
    setAddProjectStep("url");
    setNewProject(createEmptyProject());
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
    if (!isPending && !session) {
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (!isPending && session && !loading && !builder) {
      router.replace("/onboarding");
    }
  }, [isPending, session, loading, builder, router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

      // Build updated project with metadata
      const updatedProject = {
        ...newProject,
        url: normalizedUrl,
        title: data.title || newProject.title,
        description: data.description || newProject.description,
        favicon: data.favicon || newProject.favicon,
      };

      // Auto-fill store/repo links
      if (data.autoFilledLinks) {
        if (data.autoFilledLinks.appStoreUrl)
          updatedProject.appStoreUrl = data.autoFilledLinks.appStoreUrl;
        if (data.autoFilledLinks.playStoreUrl)
          updatedProject.playStoreUrl = data.autoFilledLinks.playStoreUrl;
        if (data.autoFilledLinks.githubUrl)
          updatedProject.githubUrl = data.autoFilledLinks.githubUrl;
      }

      // Auto-select suggested categories
      if (data.suggestedCategories?.length) {
        const merged = new Set([
          ...updatedProject.categories,
          ...data.suggestedCategories,
        ]);
        updatedProject.categories = [...merged];
      }

      setNewProject(updatedProject);
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
      if (data.isPublic) {
        showToast(
          "Project is live! It's now public in the directory.",
          "success",
        );
      } else {
        showToast("Project under review.", "success");
      }
    } catch (err) {
      console.error("Add project failed:", err);
      showToast("Failed to add project.");
    }
  }

  function startEditing(project: Project) {
    setEditingProjectSlug(project.slug);
    setEditProject({
      title: project.title,
      description: project.description,
      url: project.url,
      slug: project.slug,
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
    setter((prev) => ({ ...prev, categories: next }) as T);
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

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderIcon size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderIcon size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderIcon size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const displayName = builder.name?.trim() || "there";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-base-content">
            Salam, {displayName}
          </h1>
          <p className="mt-2 max-w-md text-base-content/70 leading-relaxed">
            This is your space—update your profile, add your projects, and let
            the Ummah discover your work.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <BadgeCheckIcon size={14} aria-hidden />
            Verified Builder
          </div>
        </div>
        <Link
          href={`/${builder.username}`}
          target="_blank"
          className="btn btn-outline btn-primary gap-2 rounded-xl group shrink-0"
        >
          <EyeIconComponent
            size={16}
            className="text-primary group-hover:text-primary-content transition-colors"
            aria-hidden
          />
          Preview your page
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="mb-10 flex gap-0 rounded-2xl border border-base-300 bg-base-200/80 p-1.5 shadow-sm"
      >
        <button
          role="tab"
          type="button"
          onClick={() => setActiveTab("profile")}
          aria-selected={activeTab === "profile"}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
            activeTab === "profile"
              ? "bg-primary text-primary-content shadow-md"
              : "text-base-content/70 hover:bg-base-300/60 hover:text-base-content"
          }`}
        >
          <UserIconComponent size={18} aria-hidden />
          Profile
        </button>
        <button
          role="tab"
          type="button"
          onClick={() => setActiveTab("projects")}
          aria-selected={activeTab === "projects"}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
            activeTab === "projects"
              ? "bg-primary text-primary-content shadow-md"
              : "text-base-content/70 hover:bg-base-300/60 hover:text-base-content"
          }`}
        >
          <FolderAddIconComponent size={18} aria-hidden />
          Projects
          <span
            className={`ml-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              activeTab === "projects"
                ? "bg-primary-content/20 text-primary-content"
                : "bg-base-content/15 text-base-content/80"
            }`}
          >
            {projects.length}
          </span>
        </button>
      </div>

      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="space-y-6 animate-fade-in"
        >
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Profile</legend>
            <div className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label py-1" htmlFor="profile-username">
                  <span className="label-text">Username</span>
                </label>
                <label className="input input-bordered flex items-center w-full gap-0 overflow-hidden">
                  <span className="label shrink-0 px-4 text-base-content/60">
                    deen.page/
                  </span>
                  <input
                    id="profile-username"
                    type="text"
                    value={form.username}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        username: event.target.value,
                      }))
                    }
                    className="grow min-w-0 border-0 bg-transparent px-4 py-3 focus:outline-none"
                    placeholder="your_username"
                  />
                </label>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Letters, numbers, underscores only.
                  </span>
                </label>
              </div>
              <div className="form-control">
                <label className="label" htmlFor="profile-name">
                  <span className="label-text">Name</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="profile-country">
                  <span className="label-text">Country</span>
                </label>
                <select
                  id="profile-country"
                  value={form.country}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      country: event.target.value,
                    }))
                  }
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {getFlagEmoji(c.code)} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label" htmlFor="profile-bio">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  id="profile-bio"
                  placeholder="Muslim Builder • Building for the Ummah"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      bio: e.target.value.slice(0, 280),
                    }))
                  }
                  className="textarea textarea-bordered w-full"
                  rows={2}
                  maxLength={280}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    {form.bio?.length || 0}/280
                  </span>
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Links & Socials</legend>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label" htmlFor="profile-website">
                    <span className="label-text">Website URL</span>
                  </label>
                  <input
                    id="profile-website"
                    type="url"
                    value={form.websiteUrl}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        websiteUrl: event.target.value,
                      }))
                    }
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="profile-support">
                    <span className="label-text">Support Link</span>
                  </label>
                  <input
                    id="profile-support"
                    type="url"
                    value={form.supportLink}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        supportLink: event.target.value,
                      }))
                    }
                    className="input input-bordered w-full"
                    placeholder="Buy Me a Coffee, Patreon, etc."
                  />
                </div>
              </div>

              <div>
                <label className="label font-medium pb-2">
                  Social Profiles
                </label>
                <div className="space-y-2">
                  {builder?.xHandle && (
                    <div className="flex items-center gap-2 opacity-80">
                      <img
                        src="https://www.google.com/s2/favicons?domain=x.com&sz=32"
                        alt=""
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-sm shrink-0 grayscale"
                      />
                      <input
                        type="url"
                        readOnly
                        value={`https://x.com/${builder.xHandle}`}
                        className="input input-bordered input-sm flex-1 bg-base-300/30 cursor-not-allowed"
                        title="Visitors can find and follow you on X from your page"
                      />
                    </div>
                  )}
                  {(form.socialUrls || []).map((social, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {social.url && getFaviconUrl(social.url) && (
                        <img
                          src={getFaviconUrl(social.url)}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-sm shrink-0"
                        />
                      )}
                      <input
                        type="url"
                        placeholder="https://x.com/yourhandle"
                        value={social.url}
                        onChange={(e) => {
                          const updated = [...(form.socialUrls || [])];
                          updated[index] = { url: e.target.value };
                          setForm((prev) => ({
                            ...prev,
                            socialUrls: updated,
                          }));
                        }}
                        className="input input-bordered input-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (form.socialUrls || []).filter(
                            (_, i) => i !== index,
                          );
                          setForm((prev) => ({
                            ...prev,
                            socialUrls: updated,
                          }));
                        }}
                        className="btn btn-ghost btn-xs text-error"
                        aria-label="Remove social URL"
                      >
                        <CancelIcon size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        socialUrls: [...(prev.socialUrls || []), { url: "" }],
                      }))
                    }
                    className="btn btn-ghost btn-sm gap-1"
                  >
                    <PlusIcon size={14} />
                    Add Social Profile
                  </button>
                </div>
              </div>

              <div>
                <label className="label font-medium pb-2">Link Cards</label>
                <div className="space-y-2">
                  {(form.links || []).map((link, index) => (
                    <div
                      key={index}
                      className="card bg-base-200 border border-base-300 p-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-1 pt-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const updated = [...(form.links || [])];
                              [updated[index - 1], updated[index]] = [
                                updated[index],
                                updated[index - 1],
                              ];
                              setForm((prev) => ({
                                ...prev,
                                links: updated,
                              }));
                            }}
                            className="btn btn-ghost btn-xs p-0 min-h-0 h-5 w-5"
                            aria-label="Move up"
                          >
                            <ArrowUpIcon size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={index === (form.links?.length || 0) - 1}
                            onClick={() => {
                              const updated = [...(form.links || [])];
                              [updated[index], updated[index + 1]] = [
                                updated[index + 1],
                                updated[index],
                              ];
                              setForm((prev) => ({
                                ...prev,
                                links: updated,
                              }));
                            }}
                            className="btn btn-ghost btn-xs p-0 min-h-0 h-5 w-5"
                            aria-label="Move down"
                          >
                            <ArrowDownIcon size={12} />
                          </button>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 min-w-0">
                          <input
                            type="text"
                            placeholder="Link title"
                            value={link.title}
                            onChange={(e) => {
                              const updated = [...(form.links || [])];
                              updated[index] = {
                                ...updated[index],
                                title: e.target.value,
                              };
                              setForm((prev) => ({
                                ...prev,
                                links: updated,
                              }));
                            }}
                            className="input input-bordered input-sm w-full"
                          />
                          <div className="flex items-center gap-2">
                            {link.url && getFaviconUrl(link.url) && (
                              <img
                                src={getFaviconUrl(link.url)}
                                alt=""
                                width={16}
                                height={16}
                                className="w-4 h-4 rounded-sm shrink-0"
                              />
                            )}
                            <input
                              type="url"
                              placeholder="https://example.com"
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...(form.links || [])];
                                updated[index] = {
                                  ...updated[index],
                                  url: e.target.value,
                                };
                                setForm((prev) => ({
                                  ...prev,
                                  links: updated,
                                }));
                              }}
                              className="input input-bordered input-sm flex-1"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (form.links || []).filter(
                              (_, i) => i !== index,
                            );
                            setForm((prev) => ({
                              ...prev,
                              links: updated,
                            }));
                          }}
                          className="btn btn-ghost btn-xs text-error mt-1"
                          aria-label="Remove link"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        links: [...(prev.links || []), { title: "", url: "" }],
                      }))
                    }
                    className="btn btn-ghost btn-sm gap-1"
                  >
                    <PlusIcon size={14} />
                    Add Link
                  </button>
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend flex items-center gap-2">
              <PaletteIcon size={16} />
              Appearance
            </legend>
            <p className="label text-base-content/60 mb-3">
              Choose a theme for your link-in-bio page.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {DAISYUI_THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      theme: theme,
                    }))
                  }
                  className={`relative rounded-xl border-2 p-3 text-left transition-all hover:scale-105 ${
                    form.theme === theme
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-base-300 hover:border-base-content/20"
                  }`}
                  data-theme={theme}
                >
                  {form.theme === theme && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <CheckIcon size={12} className="text-primary-content" />
                    </div>
                  )}
                  <div className="flex gap-1 mb-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <div className="w-3 h-3 rounded-full bg-accent" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-base-content truncate bg-base-100 rounded px-1.5 py-0.5">
                    {theme}
                  </div>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary gap-2"
            >
              {saving ? (
                <LoaderIcon size={16} className="animate-spin" />
              ) : (
                <SaveIconComponent size={16} />
              )}
              Save Profile
            </button>
          </div>
        </form>
      )}

      {activeTab === "projects" && (
        <div className="animate-fade-in">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-base-content">
                Your projects
              </h2>
              <p className="mt-0.5 text-sm text-base-content/60">
                {projects.length === 0
                  ? "No projects yet—add one to get started."
                  : `${projects.length} ${projects.length === 1 ? "project" : "projects"} in the directory`}
              </p>
            </div>
            <button
              onClick={() => setShowNewProject((value) => !value)}
              className="btn btn-primary gap-2 rounded-xl"
            >
              <FolderAddIconComponent size={18} />
              Add project
            </button>
          </div>

          {showNewProject && (
            <div className="card mb-6 rounded-2xl border border-base-300 bg-base-200 shadow-sm">
              <div className="card-body space-y-4">
                <h3 className="font-semibold text-lg">Add Project</h3>
                {addProjectStep === "url" ? (
                  <form onSubmit={handleFetchMetadata} className="space-y-4">
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">Project URL</legend>
                      <p className="label text-base-content/70 mb-2">
                        Paste your project URL—we&apos;ll fill in the details so
                        you can get listed and get discovered faster.
                      </p>
                      <div className="form-control">
                        <label className="label py-1" htmlFor="new-project-url">
                          <span className="label-text">URL</span>
                        </label>
                        <input
                          id="new-project-url"
                          type="url"
                          placeholder="https://example.com"
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
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm gap-1"
                          disabled={!newProject.url.trim() || fetchingMetadata}
                        >
                          {fetchingMetadata ? (
                            <LoaderIcon size={14} className="animate-spin" />
                          ) : (
                            "Fetch Details"
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
                    </fieldset>
                  </form>
                ) : (
                  <form onSubmit={handleAddProject} className="space-y-4">
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">Basic info</legend>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          {newProject.favicon && (
                            <img
                              src={newProject.favicon}
                              alt=""
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="form-control flex-1 min-w-0">
                            <label
                              className="label py-1"
                              htmlFor="new-project-title"
                            >
                              <span className="label-text">Title</span>
                            </label>
                            <input
                              id="new-project-title"
                              type="text"
                              placeholder="Project title"
                              value={newProject.title}
                              onChange={(event) =>
                                setNewProject((project) => ({
                                  ...project,
                                  title: event.target.value,
                                }))
                              }
                              className="input input-bordered input-sm w-full"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor="new-project-desc"
                          >
                            <span className="label-text">Description</span>
                          </label>
                          <textarea
                            id="new-project-desc"
                            placeholder="Short description"
                            value={newProject.description}
                            onChange={(event) =>
                              setNewProject((project) => ({
                                ...project,
                                description: event.target.value,
                              }))
                            }
                            className="textarea textarea-bordered textarea-sm w-full"
                            rows={3}
                            required
                          />
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor="new-project-favicon"
                          >
                            <span className="label-text">
                              Favicon URL (optional)
                            </span>
                          </label>
                          <input
                            id="new-project-favicon"
                            type="url"
                            placeholder="https://..."
                            value={newProject.favicon}
                            onChange={(event) =>
                              setNewProject((project) => ({
                                ...project,
                                favicon: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                      </div>
                    </fieldset>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">
                        Platforms (select all that apply)
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              toggleProjectCategory(
                                cat,
                                setNewProject,
                                newProject,
                              )
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
                    </fieldset>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">
                        Store &amp; repo links (optional)
                      </legend>
                      <div className="flex flex-col gap-3">
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor="new-project-github"
                          >
                            <span className="label-text">GitHub URL</span>
                          </label>
                          <input
                            id="new-project-github"
                            type="url"
                            placeholder="https://github.com/..."
                            value={newProject.githubUrl}
                            onChange={(event) =>
                              setNewProject((project) => ({
                                ...project,
                                githubUrl: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor="new-project-appstore"
                          >
                            <span className="label-text">App Store</span>
                          </label>
                          <input
                            id="new-project-appstore"
                            type="url"
                            placeholder="App Store link"
                            value={newProject.appStoreUrl}
                            onChange={(event) =>
                              setNewProject((project) => ({
                                ...project,
                                appStoreUrl: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor="new-project-playstore"
                          >
                            <span className="label-text">Play Store</span>
                          </label>
                          <input
                            id="new-project-playstore"
                            type="url"
                            placeholder="Play Store link"
                            value={newProject.playStoreUrl}
                            onChange={(event) =>
                              setNewProject((project) => ({
                                ...project,
                                playStoreUrl: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor="new-project-chromestore"
                          >
                            <span className="label-text">Chrome Web Store</span>
                          </label>
                          <input
                            id="new-project-chromestore"
                            type="url"
                            placeholder="Chrome Web Store link"
                            value={newProject.chromeStoreUrl}
                            onChange={(event) =>
                              setNewProject((project) => ({
                                ...project,
                                chromeStoreUrl: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                      </div>
                    </fieldset>
                    <div className="flex flex-wrap gap-2">
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
                className="card rounded-2xl border border-base-300 bg-base-200 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:border-base-content/10 hover:shadow-md"
              >
                {editingProjectSlug === project.slug ? (
                  <form
                    onSubmit={handleUpdateProject}
                    className="card-body space-y-4"
                  >
                    <h3 className="font-semibold text-lg">Edit Project</h3>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">Basic info</legend>
                      <div className="flex flex-col gap-3">
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor={`edit-slug-${project.slug}`}
                          >
                            <span className="label-text">Project page URL</span>
                          </label>
                          <label className="input input-bordered input-sm flex items-center w-full gap-0 overflow-hidden">
                            <span className="label shrink-0 px-3 text-base-content/60 text-sm">
                              deen.page/projects/
                            </span>
                            <input
                              id={`edit-slug-${project.slug}`}
                              type="text"
                              placeholder="my-project"
                              value={editProject.slug}
                              onChange={(event) =>
                                setEditProject((projectState) => ({
                                  ...projectState,
                                  slug: event.target.value,
                                }))
                              }
                              className="grow min-w-0 border-0 bg-transparent px-3 py-2 text-sm focus:outline-none"
                            />
                          </label>
                          <label className="label">
                            <span className="label-text-alt text-base-content/60">
                              Letters, numbers, hyphens only.
                            </span>
                          </label>
                        </div>
                        <div className="flex items-center gap-3">
                          {editProject.favicon && (
                            <img
                              src={editProject.favicon}
                              alt=""
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="form-control flex-1 min-w-0">
                            <label
                              className="label py-1"
                              htmlFor={`edit-title-${project.slug}`}
                            >
                              <span className="label-text">Title</span>
                            </label>
                            <input
                              id={`edit-title-${project.slug}`}
                              type="text"
                              placeholder="Project title"
                              value={editProject.title}
                              onChange={(event) =>
                                setEditProject((projectState) => ({
                                  ...projectState,
                                  title: event.target.value,
                                }))
                              }
                              className="input input-bordered input-sm w-full"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor={`edit-desc-${project.slug}`}
                          >
                            <span className="label-text">Description</span>
                          </label>
                          <textarea
                            id={`edit-desc-${project.slug}`}
                            placeholder="Description"
                            value={editProject.description}
                            onChange={(event) =>
                              setEditProject((projectState) => ({
                                ...projectState,
                                description: event.target.value,
                              }))
                            }
                            className="textarea textarea-bordered textarea-sm w-full"
                            rows={3}
                            required
                          />
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor={`edit-url-${project.slug}`}
                          >
                            <span className="label-text">Project URL</span>
                          </label>
                          <input
                            id={`edit-url-${project.slug}`}
                            type="url"
                            placeholder="https://..."
                            value={editProject.url}
                            onChange={(event) =>
                              setEditProject((projectState) => ({
                                ...projectState,
                                url: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                            required
                          />
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor={`edit-favicon-${project.slug}`}
                          >
                            <span className="label-text">
                              Favicon URL (optional)
                            </span>
                          </label>
                          <input
                            id={`edit-favicon-${project.slug}`}
                            type="url"
                            placeholder="https://..."
                            value={editProject.favicon}
                            onChange={(event) =>
                              setEditProject((projectState) => ({
                                ...projectState,
                                favicon: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                      </div>
                    </fieldset>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">
                        Platforms (select all that apply)
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              toggleProjectCategory(
                                cat,
                                setEditProject,
                                editProject,
                              )
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
                    </fieldset>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">
                        Store &amp; repo links (optional)
                      </legend>
                      <div className="flex flex-col gap-3">
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor={`edit-github-${project.slug}`}
                          >
                            <span className="label-text">GitHub URL</span>
                          </label>
                          <input
                            id={`edit-github-${project.slug}`}
                            type="url"
                            placeholder="https://github.com/..."
                            value={editProject.githubUrl}
                            onChange={(event) =>
                              setEditProject((projectState) => ({
                                ...projectState,
                                githubUrl: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor={`edit-appstore-${project.slug}`}
                          >
                            <span className="label-text">App Store</span>
                          </label>
                          <input
                            id={`edit-appstore-${project.slug}`}
                            type="url"
                            placeholder="App Store link"
                            value={editProject.appStoreUrl}
                            onChange={(event) =>
                              setEditProject((projectState) => ({
                                ...projectState,
                                appStoreUrl: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor={`edit-playstore-${project.slug}`}
                          >
                            <span className="label-text">Play Store</span>
                          </label>
                          <input
                            id={`edit-playstore-${project.slug}`}
                            type="url"
                            placeholder="Play Store link"
                            value={editProject.playStoreUrl}
                            onChange={(event) =>
                              setEditProject((projectState) => ({
                                ...projectState,
                                playStoreUrl: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div className="form-control">
                          <label
                            className="label py-1"
                            htmlFor={`edit-chromestore-${project.slug}`}
                          >
                            <span className="label-text">Chrome Web Store</span>
                          </label>
                          <input
                            id={`edit-chromestore-${project.slug}`}
                            type="url"
                            placeholder="Chrome Web Store link"
                            value={editProject.chromeStoreUrl}
                            onChange={(event) =>
                              setEditProject((projectState) => ({
                                ...projectState,
                                chromeStoreUrl: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                      </div>
                    </fieldset>
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
                        <TrashIcon size={14} />
                        Delete
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="card-body flex-row items-center gap-4 p-4 sm:p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-300/50">
                      {project.favicon || getFaviconUrl(project.url) ? (
                        <img
                          src={
                            project.favicon || getFaviconUrl(project.url) || ""
                          }
                          alt=""
                          width={24}
                          height={24}
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <GlobeIconComponent
                          size={24}
                          className="text-base-content/40"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-base-content">
                          {project.title}
                        </h3>
                        {project.isPublic ? (
                          <span
                            className="badge badge-success badge-sm gap-1 rounded-lg"
                            title="Visible in the directory"
                          >
                            <EyeIconComponent size={10} aria-hidden />
                            Public
                          </span>
                        ) : (
                          <span className="badge badge-warning badge-sm gap-1 rounded-lg">
                            <ClockIcon size={10} aria-hidden />
                            Under review
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-base-content/60">
                          {project.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(project.categories || []).map((cat) => (
                          <span
                            key={cat}
                            className="badge badge-outline badge-sm rounded-md"
                          >
                            {CATEGORY_LABELS[cat as Category] || cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(project)}
                        className="btn btn-ghost btn-sm gap-1.5 rounded-lg"
                        aria-label={`Edit ${project.title}`}
                      >
                        <PencilIconComponent size={14} aria-hidden />
                        Edit
                      </button>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="btn btn-ghost btn-sm gap-1.5 rounded-lg"
                      >
                        <ExternalLinkIcon size={14} aria-hidden />
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.slug)}
                        className="btn btn-ghost btn-sm text-error rounded-lg"
                        aria-label={`Delete ${project.title}`}
                      >
                        <TrashIcon size={14} aria-hidden />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {projects.length === 0 && !showNewProject && (
              <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/50 px-6 py-12 text-center">
                <p className="text-base-content/70">
                  No projects yet. Add your first one to appear in the directory
                  and let the community discover your work.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewProject(true)}
                  className="btn btn-primary btn-sm mt-4 gap-2 rounded-xl"
                >
                  <FolderAddIconComponent size={16} />
                  Add project
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
