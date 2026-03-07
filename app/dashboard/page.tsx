"use client";

import { useSession, signIn } from "@/lib/auth-client";
import {
  User,
  FolderPlus,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  LogIn,
  Save,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { CATEGORIES, CATEGORY_LABELS, STATUS_TAGS, type Category } from "@/lib/constants";

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

interface Invite {
  _id: string;
  code: string;
  status: string;
  expiresAt: string;
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

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [builder, setBuilder] = useState<BuilderProfile | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "invites">("profile");

  // New project form - URL first, then details
  const [showNewProject, setShowNewProject] = useState(false);
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

  // Edit project form
  const [editingProjectSlug, setEditingProjectSlug] = useState<string | null>(null);
  const [editProject, setEditProject] = useState({
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

  // Editable profile fields
  const [form, setForm] = useState({
    name: "",
    country: "",
    stack: "",
    githubUrl: "",
    websiteUrl: "",
    supportLink: "",
    statusTags: [] as string[],
  });

  const fetchData = useCallback(async () => {
    try {
      const [builderRes, invitesRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/invites"),
      ]);

      if (builderRes.ok) {
        const builderData = await builderRes.json();
        setBuilder(builderData.builder);
        setProjects(builderData.projects || []);
        setForm({
          name: builderData.builder.name || "",
          country: builderData.builder.country || "",
          stack: (builderData.builder.stack || []).join(", "),
          githubUrl: builderData.builder.githubUrl || "",
          websiteUrl: builderData.builder.websiteUrl || "",
          supportLink: builderData.builder.supportLink || "",
          statusTags: builderData.builder.statusTags || [],
        });
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData.invites || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchData();
    else setLoading(false);
  }, [session, fetchData]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          stack: form.stack.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBuilder(data.builder);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
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
    } catch (err) {
      console.error("Fetch metadata failed:", err);
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
      if (res.ok) {
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
        setAddProjectStep("url");
        setShowNewProject(false);
        fetchData();
      }
    } catch (err) {
      console.error("Add project failed:", err);
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
      if (res.ok) {
        setEditingProjectSlug(null);
        fetchData();
      }
    } catch (err) {
      console.error("Delete project failed:", err);
    }
  }

  function cancelAddProject() {
    setShowNewProject(false);
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
  }

  function toggleProjectCategory<T extends { categories: string[] }>(
    cat: string,
    setter: React.Dispatch<React.SetStateAction<T>>,
    getter: T
  ) {
    const next = getter.categories.includes(cat)
      ? getter.categories.filter((c) => c !== cat)
      : [...getter.categories, cat];
    setter((p) => ({ ...p, categories: next } as T));
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
      if (res.ok) {
        setEditingProjectSlug(null);
        fetchData();
      }
    } catch (err) {
      console.error("Update project failed:", err);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function toggleStatusTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      statusTags: prev.statusTags.includes(tag)
        ? prev.statusTags.filter((t) => t !== tag)
        : [...prev.statusTags, tag],
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
        <User size={48} className="text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-3">Builder Dashboard</h1>
        <p className="opacity-70 mb-6">
          Sign in to manage your profile and projects.
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
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-3">No Profile Found</h1>
        <p className="opacity-70 mb-6">
          You don&apos;t have a builder profile yet. Join with an invite code
          or verify an existing indexed profile.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/join" className="btn btn-primary">
            Join with Invite
          </a>
          <a href="/verify" className="btn btn-outline">
            Verify Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="opacity-50 mb-8">
        Manage your profile, projects, and invite codes.
      </p>

      {/* Tabs */}
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
        <button
          role="tab"
          className={`tab ${activeTab === "invites" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("invites")}
        >
          Invites ({invites.filter((i) => i.status === "active").length})
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
          <div className="form-control">
            <label className="label"><span className="label-text">Name</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Country</span></label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
              className="input input-bordered"
              placeholder="e.g. United Arab Emirates"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Stack (comma-separated)</span></label>
            <input
              type="text"
              value={form.stack}
              onChange={(e) => setForm((p) => ({ ...p, stack: e.target.value }))}
              className="input input-bordered"
              placeholder="e.g. Next.js, React Native, Python"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">GitHub URL</span></label>
            <input
              type="url"
              value={form.githubUrl}
              onChange={(e) => setForm((p) => ({ ...p, githubUrl: e.target.value }))}
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Website URL</span></label>
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Support Link</span></label>
            <input
              type="url"
              value={form.supportLink}
              onChange={(e) => setForm((p) => ({ ...p, supportLink: e.target.value }))}
              className="input input-bordered"
              placeholder="Buy Me a Coffee, Stripe, etc."
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Status Tags</span></label>
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
        </form>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <p className="opacity-50">{projects.length} project(s)</p>
            <button
              onClick={() => setShowNewProject(!showNewProject)}
              className="btn btn-primary btn-sm gap-2"
            >
              <FolderPlus size={16} />
              Add Project
            </button>
          </div>

          {showNewProject && (
            <div className="card bg-base-200 border border-base-300 mb-6">
              <div className="card-body space-y-3">
                <h3 className="font-semibold">Add Project</h3>
                {addProjectStep === "url" ? (
                  <form onSubmit={handleFetchMetadata} className="space-y-3">
                    <input
                      type="url"
                      placeholder="Enter project URL (e.g. https://example.com)"
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
                        onClick={cancelAddProject}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddProject} className="space-y-3">
                    <div className="flex items-center gap-3">
                      {newProject.favicon && (
                        <img
                          src={newProject.favicon}
                          alt=""
                          className="w-10 h-10 rounded-lg"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Project title"
                        value={newProject.title}
                        onChange={(e) =>
                          setNewProject((p) => ({ ...p, title: e.target.value }))
                        }
                        className="input input-bordered input-sm flex-1"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject((p) => ({ ...p, description: e.target.value }))
                      }
                      className="textarea textarea-bordered textarea-sm"
                      rows={3}
                      required
                    />
                    <input
                      type="url"
                      placeholder="Favicon URL (optional)"
                      value={newProject.favicon}
                      onChange={(e) =>
                        setNewProject((p) => ({ ...p, favicon: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text">Platforms (select all that apply)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleProjectCategory(cat, setNewProject, newProject)}
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
                      onChange={(e) =>
                        setNewProject((p) => ({ ...p, githubUrl: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="App Store link (optional)"
                      value={newProject.appStoreUrl}
                      onChange={(e) =>
                        setNewProject((p) => ({ ...p, appStoreUrl: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="Play Store link (optional)"
                      value={newProject.playStoreUrl}
                      onChange={(e) =>
                        setNewProject((p) => ({ ...p, playStoreUrl: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="Chrome Web Store link (optional)"
                      value={newProject.chromeStoreUrl}
                      onChange={(e) =>
                        setNewProject((p) => ({ ...p, chromeStoreUrl: e.target.value }))
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
                        onClick={cancelAddProject}
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
                className="card bg-base-200 border border-base-300"
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
                          className="w-10 h-10 rounded-lg"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Project title"
                        value={editProject.title}
                        onChange={(e) =>
                          setEditProject((p) => ({ ...p, title: e.target.value }))
                        }
                        className="input input-bordered input-sm flex-1"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={editProject.description}
                      onChange={(e) =>
                        setEditProject((p) => ({
                          ...p,
                          description: e.target.value,
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
                      onChange={(e) =>
                        setEditProject((p) => ({ ...p, url: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Favicon URL (optional)"
                      value={editProject.favicon}
                      onChange={(e) =>
                        setEditProject((p) => ({ ...p, favicon: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text">Platforms (select all that apply)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleProjectCategory(cat, setEditProject, editProject)}
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
                      onChange={(e) =>
                        setEditProject((p) => ({ ...p, githubUrl: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="App Store link (optional)"
                      value={editProject.appStoreUrl}
                      onChange={(e) =>
                        setEditProject((p) => ({ ...p, appStoreUrl: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="Play Store link (optional)"
                      value={editProject.playStoreUrl}
                      onChange={(e) =>
                        setEditProject((p) => ({ ...p, playStoreUrl: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="url"
                      placeholder="Chrome Web Store link (optional)"
                      value={editProject.chromeStoreUrl}
                      onChange={(e) =>
                        setEditProject((p) => ({ ...p, chromeStoreUrl: e.target.value }))
                      }
                      className="input input-bordered input-sm"
                    />
                    <div className="flex gap-2 flex-wrap">
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
                  <div className="card-body p-4 flex-row items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
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
                      <a
                        href={`/projects/${project.slug}`}
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <ExternalLink size={14} />
                        View
                      </a>
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
          </div>
        </div>
      )}

      {/* Invites Tab */}
      {activeTab === "invites" && (
        <div className="animate-fade-in">
          <p className="opacity-50 mb-4">
            Share these codes with others in the Muslim Builders & Islamic Projects community to invite them.
          </p>
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite._id}
                className="card bg-base-200 border border-base-300"
              >
                <div className="card-body p-4 flex-row items-center justify-between">
                  <div>
                    <code className="text-lg font-mono tracking-wider">
                      {invite.code}
                    </code>
                    <p className="text-xs opacity-50 mt-1">
                      {invite.status === "active"
                        ? `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`
                        : invite.status}
                    </p>
                  </div>
                  {invite.status === "active" && (
                    <button
                      onClick={() => copyCode(invite.code)}
                      className="btn btn-ghost btn-sm gap-1"
                    >
                      {copiedCode === invite.code ? (
                        <Check size={14} className="text-success" />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedCode === invite.code ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {invites.length === 0 && (
              <p className="text-center py-8 opacity-40">
                No invite codes yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
