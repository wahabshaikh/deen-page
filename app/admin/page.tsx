"use client";

import { useSession, signIn } from "@/lib/auth-client";
import {
  Loader2,
  LogIn,
  ShieldX,
  UserPlus,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { CATEGORIES, CATEGORY_LABELS, STATUS_TAGS, type Category } from "@/lib/constants";

interface Builder {
  _id: string;
  name: string;
  xHandle: string;
  slug: string;
  status: string;
  avatar?: string;
}

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const [adminOk, setAdminOk] = useState<boolean | null>(null);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add builder form
  const [showAddBuilder, setShowAddBuilder] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [newBuilder, setNewBuilder] = useState({
    name: "",
    xHandle: "",
    slug: "",
    avatar: "",
    country: "",
    githubUrl: "",
    websiteUrl: "",
    supportLink: "",
    statusTags: [] as string[],
    stack: "",
  });

  // Add project form (one shared form with builder select)
  const [showAddProject, setShowAddProject] = useState(false);
  const [addProjectBuilderId, setAddProjectBuilderId] = useState("");
  const [addProjectStep, setAddProjectStep] = useState<"url" | "details">("url");
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    url: "",
    favicon: "",
    categories: [] as string[],
    githubUrl: "",
    appStoreUrl: "",
    playStoreUrl: "",
    chromeStoreUrl: "",
  });

  const checkAdmin = useCallback(async () => {
    const res = await fetch("/api/admin/me");
    setAdminOk(res.ok);
  }, []);

  const fetchBuilders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/builders");
      if (res.ok) {
        const data = await res.json();
        setBuilders(data.builders || []);
      }
    } catch {
      setBuilders([]);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setAdminOk(false);
      setLoading(false);
      return;
    }
    checkAdmin().finally(() => setLoading(false));
  }, [session, checkAdmin]);

  useEffect(() => {
    if (adminOk) fetchBuilders();
  }, [adminOk, fetchBuilders]);

  async function handleAddBuilder(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBuilder,
          stack: newBuilder.stack
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create builder");
        return;
      }
      setBuilders((prev) => [data.builder, ...prev]);
      setNewBuilder({
        name: "",
        xHandle: "",
        slug: "",
        avatar: "",
        country: "",
        githubUrl: "",
        websiteUrl: "",
        supportLink: "",
        statusTags: [],
        stack: "",
      });
      setShowAddBuilder(false);
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  }

  function openAddProject(builderId: string) {
    setAddProjectBuilderId(builderId);
    setAddProjectStep("url");
    setNewProject({
      title: "",
      description: "",
      url: "",
      favicon: "",
      categories: [],
      githubUrl: "",
      appStoreUrl: "",
      playStoreUrl: "",
      chromeStoreUrl: "",
    });
    setShowAddProject(true);
  }

  async function handleFetchMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!newProject.url.trim()) return;
    setFetchingMetadata(true);
    try {
      const res = await fetch(
        `/api/projects/metadata?url=${encodeURIComponent(newProject.url)}`
      );
      if (res.ok) {
        const data = await res.json();
        setNewProject((p) => ({
          ...p,
          title: data.title || p.title,
          description: data.description || p.description,
          favicon: data.favicon || p.favicon,
        }));
        setAddProjectStep("details");
      }
    } catch {
      setError("Failed to fetch URL metadata");
    } finally {
      setFetchingMetadata(false);
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (!addProjectBuilderId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          builderId: addProjectBuilderId,
          ...newProject,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create project");
        return;
      }
      setShowAddProject(false);
      setAddProjectBuilderId("");
      setNewProject({
        title: "",
        description: "",
        url: "",
        favicon: "",
        categories: [],
        githubUrl: "",
        appStoreUrl: "",
        playStoreUrl: "",
        chromeStoreUrl: "",
      });
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleFetchTwitterProfile(e: React.FormEvent) {
    e.preventDefault();
    const handle = newBuilder.xHandle.trim().replace(/^@/, "");
    if (!handle) {
      setError("Enter an X handle");
      return;
    }
    setFetchingProfile(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/twitter-profile?userName=${encodeURIComponent(handle)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to fetch profile");
        return;
      }
      setNewBuilder((p) => ({
        ...p,
        name: data.name ?? p.name,
        xHandle: data.userName ?? handle,
        slug: (data.userName ?? handle).toLowerCase(),
        avatar: data.profilePicture ?? p.avatar,
        country: data.location ?? p.country,
      }));
    } catch {
      setError("Request failed");
    } finally {
      setFetchingProfile(false);
    }
  }

  function toggleBuilderStatusTag(tag: string) {
    setNewBuilder((p) => ({
      ...p,
      statusTags: p.statusTags.includes(tag)
        ? p.statusTags.filter((t) => t !== tag)
        : [...p.statusTags, tag],
    }));
  }

  function toggleProjectCategory(cat: string) {
    setNewProject((p) => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter((c) => c !== cat)
        : [...p.categories, cat],
    }));
  }

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShieldX size={48} className="text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-3">Admin</h1>
        <p className="opacity-70 mb-6">
          Sign in with the admin account to manage builders and projects.
        </p>
        <button
          onClick={() =>
            signIn.social({ provider: "twitter", callbackURL: "/admin" })
          }
          className="btn btn-primary gap-2"
        >
          <LogIn size={16} />
          Sign in with X
        </button>
      </div>
    );
  }

  if (adminOk === false) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShieldX size={48} className="text-error mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-3">Access denied</h1>
        <p className="opacity-70 mb-6">
          Only the admin email can access this page.
        </p>
        <a href="/" className="btn btn-ghost">
          Back to home
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Admin</h1>
      <p className="opacity-50 mb-8">
        Add builders and their projects to the directory.
      </p>

      {error && (
        <div className="alert alert-error mb-6" role="alert">
          {error}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setError(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Add builder */}
      <div className="card bg-base-200 border border-base-300 mb-8">
        <button
          type="button"
          className="card-body flex-row items-center justify-between"
          onClick={() => setShowAddBuilder(!showAddBuilder)}
          aria-expanded={showAddBuilder}
        >
          <span className="font-semibold flex items-center gap-2">
            <UserPlus size={18} />
            Add builder
          </span>
          {showAddBuilder ? (
            <ChevronUp size={18} className="opacity-60" />
          ) : (
            <ChevronDown size={18} className="opacity-60" />
          )}
        </button>
        {showAddBuilder && (
          <div className="card-body pt-0 space-y-3 border-t border-base-300">
            <form
              onSubmit={handleFetchTwitterProfile}
              className="flex flex-wrap items-end gap-2"
            >
              <div className="form-control flex-1 min-w-[200px]">
                <label className="label py-1">
                  <span className="label-text">X handle</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. wahabshaikh or @wahabshaikh"
                  value={newBuilder.xHandle}
                  onChange={(e) =>
                    setNewBuilder((p) => ({ ...p, xHandle: e.target.value }))
                  }
                  className="input input-bordered input-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!newBuilder.xHandle.trim() || fetchingProfile}
                className="btn btn-primary btn-sm gap-1"
              >
                {fetchingProfile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Fetch profile"
                )}
              </button>
            </form>
            <p className="text-sm opacity-60">
              Paste an X handle and click Fetch profile to fill name, avatar, and slug (slug = handle).
            </p>

            <form
              onSubmit={handleAddBuilder}
              className="space-y-3 pt-2 border-t border-base-300"
            >
              <input
                type="text"
                placeholder="Name *"
                value={newBuilder.name}
                onChange={(e) =>
                  setNewBuilder((p) => ({ ...p, name: e.target.value }))
                }
                className="input input-bordered input-sm"
                required
              />
              <input
                type="text"
                placeholder="Slug * (same as X handle)"
                value={newBuilder.slug}
                onChange={(e) =>
                  setNewBuilder((p) => ({ ...p, slug: e.target.value }))
                }
                className="input input-bordered input-sm"
                required
              />
              <input
                type="url"
                placeholder="Avatar URL"
                value={newBuilder.avatar}
                onChange={(e) =>
                  setNewBuilder((p) => ({ ...p, avatar: e.target.value }))
                }
                className="input input-bordered input-sm"
              />
              <input
                type="text"
                placeholder="Country"
                value={newBuilder.country}
                onChange={(e) =>
                  setNewBuilder((p) => ({ ...p, country: e.target.value }))
                }
                className="input input-bordered input-sm"
              />
              <input
                type="url"
                placeholder="GitHub URL"
                value={newBuilder.githubUrl}
                onChange={(e) =>
                  setNewBuilder((p) => ({ ...p, githubUrl: e.target.value }))
                }
                className="input input-bordered input-sm"
              />
              <input
                type="url"
                placeholder="Website URL"
                value={newBuilder.websiteUrl}
                onChange={(e) =>
                  setNewBuilder((p) => ({ ...p, websiteUrl: e.target.value }))
                }
                className="input input-bordered input-sm"
              />
              <input
                type="url"
                placeholder="Support link"
                value={newBuilder.supportLink}
                onChange={(e) =>
                  setNewBuilder((p) => ({ ...p, supportLink: e.target.value }))
                }
                className="input input-bordered input-sm"
              />
              <input
                type="text"
                placeholder="Stack (comma-separated)"
                value={newBuilder.stack}
                onChange={(e) =>
                  setNewBuilder((p) => ({ ...p, stack: e.target.value }))
                }
                className="input input-bordered input-sm"
              />
              <div>
                <p className="text-sm opacity-70 mb-1">Status tags</p>
                <div className="flex flex-wrap gap-1">
                  {STATUS_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleBuilderStatusTag(tag)}
                      className={`badge badge-sm cursor-pointer ${
                        newBuilder.statusTags.includes(tag)
                          ? "badge-primary"
                          : "badge-outline"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-sm gap-1"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  Create builder
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBuilder(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Builders list */}
      <h2 className="text-xl font-semibold mb-4">Builders ({builders.length})</h2>
      <div className="space-y-2 mb-8">
        {builders.map((b) => (
          <div
            key={b._id}
            className="card bg-base-200 border border-base-300"
          >
            <div className="card-body p-4 flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {b.avatar ? (
                  <img
                    src={b.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center text-lg font-semibold shrink-0">
                    {b.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{b.name}</p>
                  <p className="text-sm opacity-60 truncate">
                    @{b.xHandle} · /{b.slug}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-xs gap-1"
                >
                  <ExternalLink size={14} />
                  View
                </a>
                <button
                  type="button"
                  onClick={() => openAddProject(b._id)}
                  className="btn btn-primary btn-xs gap-1"
                >
                  <FolderPlus size={14} />
                  Add project
                </button>
              </div>
            </div>
          </div>
        ))}
        {builders.length === 0 && (
          <p className="text-center py-8 opacity-50">
            No builders yet. Add one above.
          </p>
        )}
      </div>

      {/* Add project modal / panel */}
      {showAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card bg-base-100 border border-base-300 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body">
              <h3 className="font-semibold text-lg">Add project</h3>
              <p className="text-sm opacity-60 mb-4">
                Builder:{" "}
                {builders.find((b) => b._id === addProjectBuilderId)?.name ??
                  addProjectBuilderId}
              </p>
              {addProjectStep === "url" ? (
                <form
                  onSubmit={handleFetchMetadata}
                  className="space-y-3"
                >
                  <input
                    type="url"
                    placeholder="Project URL"
                    value={newProject.url}
                    onChange={(e) =>
                      setNewProject((p) => ({ ...p, url: e.target.value }))
                    }
                    className="input input-bordered input-sm w-full"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={
                        !newProject.url.trim() || fetchingMetadata
                      }
                    >
                      {fetchingMetadata ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Fetch details"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddProject(false)}
                      className="btn btn-ghost btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={handleAddProject}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    {newProject.favicon && (
                      <img
                        src={newProject.favicon}
                        alt=""
                        className="w-8 h-8 rounded"
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Title *"
                      value={newProject.title}
                      onChange={(e) =>
                        setNewProject((p) => ({
                          ...p,
                          title: e.target.value,
                        }))
                      }
                      className="input input-bordered input-sm flex-1"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Description *"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="textarea textarea-bordered textarea-sm w-full"
                    rows={3}
                    required
                  />
                  <input
                    type="url"
                    placeholder="Favicon URL"
                    value={newProject.favicon}
                    onChange={(e) =>
                      setNewProject((p) => ({ ...p, favicon: e.target.value }))
                    }
                    className="input input-bordered input-sm w-full"
                  />
                  <div>
                    <p className="text-sm opacity-70 mb-1">
                      Categories (select at least one) *
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleProjectCategory(cat)}
                          className={`badge badge-sm cursor-pointer ${
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
                    placeholder="GitHub URL"
                    value={newProject.githubUrl}
                    onChange={(e) =>
                      setNewProject((p) => ({
                        ...p,
                        githubUrl: e.target.value,
                      }))
                    }
                    className="input input-bordered input-sm w-full"
                  />
                  <input
                    type="url"
                    placeholder="App Store"
                    value={newProject.appStoreUrl}
                    onChange={(e) =>
                      setNewProject((p) => ({
                        ...p,
                        appStoreUrl: e.target.value,
                      }))
                    }
                    className="input input-bordered input-sm w-full"
                  />
                  <input
                    type="url"
                    placeholder="Play Store"
                    value={newProject.playStoreUrl}
                    onChange={(e) =>
                      setNewProject((p) => ({
                        ...p,
                        playStoreUrl: e.target.value,
                      }))
                    }
                    className="input input-bordered input-sm w-full"
                  />
                  <input
                    type="url"
                    placeholder="Chrome Web Store"
                    value={newProject.chromeStoreUrl}
                    onChange={(e) =>
                      setNewProject((p) => ({
                        ...p,
                        chromeStoreUrl: e.target.value,
                      }))
                    }
                    className="input input-bordered input-sm w-full"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAddProjectStep("url")}
                      className="btn btn-ghost btn-sm"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={
                        saving || newProject.categories.length === 0
                      }
                      className="btn btn-primary btn-sm gap-1"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <FolderPlus size={14} />
                      )}
                      Create project
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddProject(false)}
                      className="btn btn-ghost btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
