"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  BadgeCheck,
  ExternalLink,
  FolderPlus,
  Loader2,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
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
  githubUrl?: string;
  websiteUrl?: string;
  statusTags: string[];
  supportLink?: string;
  status: string;
  username: string;
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
  const [newProjectKeywordMatches, setNewProjectKeywordMatches] = useState<
    string[]
  >([]);

  const [editingProjectSlug, setEditingProjectSlug] = useState<string | null>(
    null,
  );
  const [editProject, setEditProject] = useState(createEmptyProject);

  const [form, setForm] = useState({
    name: "",
    username: "",
    country: "",
    githubUrl: "",
    websiteUrl: "",
    supportLink: "",
    statusTags: [] as string[],
  });

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
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Toast toast={toast} onDismiss={dismissToast} />

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
          aria-selected={activeTab === "profile"}
        >
          Profile
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "projects" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("projects")}
          aria-selected={activeTab === "projects"}
        >
          Projects ({projects.length})
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
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Links</legend>
            <div className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label" htmlFor="profile-github">
                  <span className="label-text">GitHub URL</span>
                </label>
                <input
                  id="profile-github"
                  type="url"
                  value={form.githubUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      githubUrl: event.target.value,
                    }))
                  }
                  className="input input-bordered w-full"
                />
              </div>
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
                  placeholder="Buy Me a Coffee, Stripe, etc."
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Status Tags</legend>
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
          </fieldset>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary gap-2"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Profile
            </button>
          </div>
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
              <div className="card-body space-y-4">
                <h3 className="font-semibold text-lg">Add Project</h3>
                {addProjectStep === "url" ? (
                  <form onSubmit={handleFetchMetadata} className="space-y-4">
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">Project URL</legend>
                      <p className="label text-base-content/70 mb-2">
                        Start with the project URL. We&apos;ll fetch the title
                        and description, then check them against the Islamic
                        keyword list.
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
                            <Loader2 size={14} className="animate-spin" />
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
                    {newProjectKeywordMatches.length > 0 && (
                      <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-base-content">
                        Keyword match:{" "}
                        <span className="font-medium">
                          {newProjectKeywordMatches.join(", ")}
                        </span>
                      </div>
                    )}
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
                className="card border border-base-300 bg-base-200"
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
                        aria-label={`Edit ${project.title}`}
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
                        aria-label={`Delete ${project.title}`}
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
