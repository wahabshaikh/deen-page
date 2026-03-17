"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Loader2,
  ShieldX,
  UserPlus,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Briefcase,
  CheckCircle,
  XCircle,
  Trash2,
  Globe,
  Eye,
  Clock,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { CATEGORIES, CATEGORY_LABELS, STATUS_TAGS, type Category } from "@/lib/constants";
import { COUNTRIES, getFlagEmoji } from "@/lib/countries";
import { upgradeTwitterProfileImage } from "@/lib/url";

interface Project {
  _id: string;
  title: string;
  description: string;
  url: string;
  favicon?: string;
  categories: string[];
  githubUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  chromeStoreUrl?: string;
  builderId: string | { _id: string; name?: string; username?: string; xHandle?: string; avatar?: string };
  slug: string;
  isPublic?: boolean;
}

interface Builder {
  _id: string;
  name: string;
  xHandle: string;
  username: string;
  status: string;
  avatar?: string;
  projects?: Project[];
}

interface JobListing {
  _id: string;
  companyName: string;
  companyUrl: string;
  companyFavicon?: string;
  companyDescription?: string;
  listingUrl: string;
  status: string;
  createdAt: string;
}

function CopyButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="btn btn-ghost btn-xs gap-1"
      title="Copy link"
    >
      {copied ? (
        <>
          <Check size={14} className="text-success" />
          <span className="text-success">Copied</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [adminOk, setAdminOk] = useState<boolean | null>(null);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [pendingJobs, setPendingJobs] = useState<JobListing[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add builder form
  const [showAddBuilder, setShowAddBuilder] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [newBuilder, setNewBuilder] = useState({
    name: "",
    xHandle: "",
    username: "",
    avatar: "",
    country: "",
    githubUrl: "",
    websiteUrl: "",
    supportLink: "",
    statusTags: [] as string[],
  });

  // Add/Edit project form
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<"add" | "edit">("add");
  const [activeBuilderId, setActiveBuilderId] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [projectStep, setProjectStep] = useState<"url" | "details">("url");
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [activeProject, setActiveProject] = useState({
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

  const fetchPendingJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/jobs?status=pending");
      if (res.ok) {
        const data = await res.json();
        setPendingJobs(data.jobs || []);
      }
    } catch {
      setPendingJobs([]);
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
    if (!isPending && !session) {
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  const fetchPendingReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects/review");
      if (res.ok) {
        const data = await res.json();
        setPendingReviews(data.projects || []);
      }
    } catch {
      setPendingReviews([]);
    }
  }, []);

  useEffect(() => {
    if (adminOk) {
      fetchBuilders();
      fetchPendingJobs();
      fetchPendingReviews();
    }
  }, [adminOk, fetchBuilders, fetchPendingJobs, fetchPendingReviews]);

  async function handleAddBuilder(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBuilder),
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
        username: "",
        avatar: "",
        country: "",
        githubUrl: "",
        websiteUrl: "",
        supportLink: "",
        statusTags: [],
      });
      setShowAddBuilder(false);
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  }

  function openAddProject(builderId: string) {
    setActiveBuilderId(builderId);
    setProjectModalMode("add");
    setEditProjectId("");
    setProjectStep("url");
    setActiveProject({
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
    setShowProjectModal(true);
  }

  function openEditProject(builderId: string, project: Project) {
    setActiveBuilderId(builderId);
    setProjectModalMode("edit");
    setEditProjectId(project._id);
    setProjectStep("details");
    setActiveProject({
      title: project.title || "",
      description: project.description || "",
      url: project.url || "",
      favicon: project.favicon || "",
      categories: project.categories || [],
      githubUrl: project.githubUrl || "",
      appStoreUrl: project.appStoreUrl || "",
      playStoreUrl: project.playStoreUrl || "",
      chromeStoreUrl: project.chromeStoreUrl || "",
    });
    setShowProjectModal(true);
  }

  async function handleFetchMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProject.url.trim()) return;
    setFetchingMetadata(true);
    try {
      const res = await fetch(
        `/api/projects/metadata?url=${encodeURIComponent(activeProject.url)}`
      );
      if (res.ok) {
        const data = await res.json();
        setActiveProject((p) => ({
          ...p,
          title: data.title || p.title,
          description: data.description || p.description,
          favicon: data.favicon || p.favicon,
        }));
        setProjectStep("details");
      }
    } catch {
      setError("Failed to fetch URL metadata");
    } finally {
      setFetchingMetadata(false);
    }
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBuilderId) return;
    setSaving(true);
    setError(null);
    try {
      const url =
        projectModalMode === "add"
          ? "/api/admin/projects"
          : `/api/admin/projects/${editProjectId}`;
      const method = projectModalMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          builderId: activeBuilderId,
          ...activeProject,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || `Failed to ${projectModalMode} project`);
        return;
      }
      
      await fetchBuilders(); // Refresh lists

      setShowProjectModal(false);
      setActiveBuilderId("");
      setActiveProject({
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

  async function handleDeleteProject(projectId: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete project");
        return;
      }
      await fetchBuilders(); // Refresh lists
    } catch {
      setError("Failed to delete project");
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
        username: (data.userName ?? handle).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, ""),
        avatar: data.profilePicture ?? p.avatar,
        country: data.location ?? p.country,
      }));
    } catch {
      setError("Request failed");
    } finally {
      setFetchingProfile(false);
    }
  }

  async function handleJobAction(jobId: string, action: "approve" | "reject") {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : "rejected",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || `Failed to ${action} job`);
        return;
      }
      await fetchPendingJobs();
    } catch {
      setError(`Failed to ${action} job`);
    }
  }

  async function handleDeleteJob(jobId: string) {
    if (!confirm("Are you sure you want to delete this job listing?")) return;
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete job");
        return;
      }
      await fetchPendingJobs();
    } catch {
      setError("Failed to delete job");
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
    setActiveProject((p) => ({
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
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

      {/* Projects Under Review */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Projects Under Review ({pendingReviews.length})
        </h2>
        {pendingReviews.length > 0 ? (
          <div className="space-y-3">
            {pendingReviews.map((project) => {
              const builder = typeof project.builderId === 'object' ? project.builderId : null;
              return (
                <div key={project._id} className="card bg-base-200 border border-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {project.favicon ? (
                          <img
                            src={project.favicon}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center shrink-0">
                            <Globe size={18} className="opacity-40" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{project.title}</p>
                          {builder && (
                            <p className="text-xs opacity-50 truncate">by {builder.name || builder.username}</p>
                          )}
                          <p className="text-xs opacity-50 truncate">{project.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener"
                          className="btn btn-ghost btn-xs gap-1"
                        >
                          <ExternalLink size={14} />
                          Visit
                        </a>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/admin/projects/review", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ projectId: project._id }),
                              });
                              if (!res.ok) {
                                const data = await res.json();
                                setError(data.error || "Failed to approve project");
                                return;
                              }
                              await fetchPendingReviews();
                            } catch {
                              setError("Failed to approve project");
                            }
                          }}
                          className="btn btn-success btn-xs gap-1"
                        >
                          <Eye size={14} />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project._id)}
                          className="btn btn-ghost btn-xs text-error"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-sm opacity-70 mt-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-6 opacity-50 text-sm">
            No projects pending review.
          </p>
        )}
      </div>

      {/* Pending Jobs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Briefcase size={20} />
          Pending Jobs ({pendingJobs.length})
        </h2>
        {pendingJobs.length > 0 ? (
          <div className="space-y-3">
            {pendingJobs.map((job) => (
              <div
                key={job._id}
                className="card bg-base-200 border border-base-300"
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {job.companyFavicon ? (
                        <img
                          src={job.companyFavicon}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center shrink-0">
                          <Globe size={18} className="opacity-40" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{job.companyName}</p>
                        <p className="text-xs opacity-50 truncate">{job.companyUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={job.companyUrl}
                        target="_blank"
                        rel="noopener"
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <ExternalLink size={14} />
                        Company
                      </a>
                      <a
                        href={job.listingUrl}
                        target="_blank"
                        rel="noopener"
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <ExternalLink size={14} />
                        Jobs
                      </a>
                      <button
                        type="button"
                        onClick={() => handleJobAction(job._id, "approve")}
                        className="btn btn-success btn-xs gap-1"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleJobAction(job._id, "reject")}
                        className="btn btn-warning btn-xs gap-1"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job._id)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {job.companyDescription && (
                    <p className="text-sm opacity-70 mt-2 line-clamp-2">
                      {job.companyDescription}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 opacity-50 text-sm">
            No pending job submissions.
          </p>
        )}
      </div>

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
          <div className="card-body pt-0 space-y-4 border-t border-base-300">
            <form
              onSubmit={handleFetchTwitterProfile}
              className="flex flex-wrap items-end gap-2"
            >
              <div className="form-control flex-1 min-w-[200px]">
                <label className="label py-1" htmlFor="admin-x-handle">
                  <span className="label-text">X handle</span>
                </label>
                <input
                  id="admin-x-handle"
                  type="text"
                  placeholder="e.g. wahabshaikh or @wahabshaikh"
                  value={newBuilder.xHandle}
                  onChange={(e) =>
                    setNewBuilder((p) => ({ ...p, xHandle: e.target.value }))
                  }
                  className="input input-bordered input-sm w-full"
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
            <p className="label text-base-content/60">
              Paste an X handle and click Fetch profile to fill name, avatar, and slug.
            </p>

            <form
              onSubmit={handleAddBuilder}
              className="space-y-4 pt-4 border-t border-base-300"
            >
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Builder details</legend>
                <div className="flex flex-col gap-3">
                  <div className="form-control">
                    <label className="label py-1" htmlFor="admin-builder-name">
                      <span className="label-text">Name</span>
                    </label>
                    <input
                      id="admin-builder-name"
                      type="text"
                      placeholder="Display name"
                      value={newBuilder.name}
                      onChange={(e) =>
                        setNewBuilder((p) => ({ ...p, name: e.target.value }))
                      }
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1" htmlFor="admin-builder-username">
                      <span className="label-text">Username</span>
                      <span className="label-text-alt">Letters, numbers, underscores</span>
                    </label>
                    <input
                      id="admin-builder-username"
                      type="text"
                      placeholder="username"
                      value={newBuilder.username}
                      onChange={(e) =>
                        setNewBuilder((p) => ({ ...p, username: e.target.value }))
                      }
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1" htmlFor="admin-builder-avatar">
                      <span className="label-text">Avatar URL</span>
                    </label>
                    <input
                      id="admin-builder-avatar"
                      type="url"
                      placeholder="https://..."
                      value={newBuilder.avatar}
                      onChange={(e) =>
                        setNewBuilder((p) => ({ ...p, avatar: e.target.value }))
                      }
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1" htmlFor="admin-builder-country">
                      <span className="label-text">Country</span>
                    </label>
                    <select
                      id="admin-builder-country"
                      value={newBuilder.country}
                      onChange={(e) =>
                        setNewBuilder((p) => ({ ...p, country: e.target.value }))
                      }
                      className="select select-bordered select-sm w-full"
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
                <div className="flex flex-col gap-3">
                  <div className="form-control">
                    <label className="label py-1" htmlFor="admin-builder-github">
                      <span className="label-text">GitHub URL</span>
                    </label>
                    <input
                      id="admin-builder-github"
                      type="url"
                      placeholder="https://github.com/..."
                      value={newBuilder.githubUrl}
                      onChange={(e) =>
                        setNewBuilder((p) => ({ ...p, githubUrl: e.target.value }))
                      }
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1" htmlFor="admin-builder-website">
                      <span className="label-text">Website URL</span>
                    </label>
                    <input
                      id="admin-builder-website"
                      type="url"
                      placeholder="https://..."
                      value={newBuilder.websiteUrl}
                      onChange={(e) =>
                        setNewBuilder((p) => ({ ...p, websiteUrl: e.target.value }))
                      }
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1" htmlFor="admin-builder-support">
                      <span className="label-text">Support link</span>
                    </label>
                    <input
                      id="admin-builder-support"
                      type="url"
                      placeholder="https://..."
                      value={newBuilder.supportLink}
                      onChange={(e) =>
                        setNewBuilder((p) => ({ ...p, supportLink: e.target.value }))
                      }
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                </div>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Status tags</legend>
                <div className="flex flex-wrap gap-2">
                  {STATUS_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleBuilderStatusTag(tag)}
                      className={`badge badge-sm cursor-pointer transition-all ${
                        newBuilder.statusTags.includes(tag)
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
      <div className="space-y-4 mb-8">
        {builders.map((b) => (
          <div
            key={b._id}
            className="card bg-base-200 border border-base-300"
          >
            <div className="card-body p-4 flex-col gap-4">
              <div className="flex-row flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {b.avatar ? (
                    <img
                      src={upgradeTwitterProfileImage(b.avatar) ?? b.avatar}
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
                      @{b.xHandle} · /{b.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/${b.username}`}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-ghost btn-xs gap-1"
                  >
                    <ExternalLink size={14} />
                    View
                  </a>
                  <CopyButton path={`/${b.username}`} />
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
              
              {/* Projects List */}
              {b.projects && b.projects.length > 0 && (
                <div className="mt-2 space-y-2 pl-4 border-l-2 border-base-300">
                  {b.projects.map(p => (
                    <div key={p._id} className="flex items-center justify-between bg-base-100 p-2 rounded-md border border-base-300">
                      <div className="flex items-center gap-2 min-w-0">
                        {p.favicon && <img src={p.favicon} alt="" className="w-6 h-6 rounded shrink-0" />}
                        <p className="font-medium text-sm truncate">{p.title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <CopyButton path={`/projects/${p.slug}`} />
                        <button
                          type="button"
                          onClick={() => openEditProject(b._id, p)}
                          className="btn btn-ghost btn-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(p._id)}
                          className="btn btn-ghost btn-xs text-error pr-0"
                          title="Delete project"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {builders.length === 0 && (
          <p className="text-center py-8 opacity-50">
            No builders yet. Add one above.
          </p>
        )}
      </div>

      {/* Add/Edit project modal / panel */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card bg-base-100 border border-base-300 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body">
              <h3 className="font-semibold text-lg">{projectModalMode === "add" ? "Add project" : "Edit project"}</h3>
              <p className="text-sm opacity-60 mb-4">
                Builder:{" "}
                {builders.find((b) => b._id === activeBuilderId)?.name ??
                  activeBuilderId}
              </p>
              {projectStep === "url" ? (
                <form
                  onSubmit={handleFetchMetadata}
                  className="space-y-4"
                >
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Project URL</legend>
                    <div className="form-control">
                      <label className="label py-1" htmlFor="admin-project-url">
                        <span className="label-text">URL</span>
                      </label>
                      <input
                        id="admin-project-url"
                        type="url"
                        placeholder="https://..."
                        value={activeProject.url}
                        onChange={(e) =>
                          setActiveProject((p) => ({ ...p, url: e.target.value }))
                        }
                        className="input input-bordered input-sm w-full"
                        required
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={
                          !activeProject.url.trim() || fetchingMetadata
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
                        onClick={() => setShowProjectModal(false)}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </fieldset>
                </form>
              ) : (
                <form
                  onSubmit={handleSaveProject}
                  className="space-y-4"
                >
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Basic info</legend>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        {activeProject.favicon && (
                          <img
                            src={activeProject.favicon}
                            alt=""
                            className="w-8 h-8 rounded object-cover shrink-0"
                          />
                        )}
                        <div className="form-control flex-1 min-w-0">
                          <label className="label py-1" htmlFor="admin-project-title">
                            <span className="label-text">Title</span>
                          </label>
                          <input
                            id="admin-project-title"
                            type="text"
                            placeholder="Project title"
                            value={activeProject.title}
                            onChange={(e) =>
                              setActiveProject((p) => ({
                                ...p,
                                title: e.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-control">
                        <label className="label py-1" htmlFor="admin-project-desc">
                          <span className="label-text">Description</span>
                        </label>
                        <textarea
                          id="admin-project-desc"
                          placeholder="Short description"
                          value={activeProject.description}
                          onChange={(e) =>
                            setActiveProject((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          className="textarea textarea-bordered textarea-sm w-full"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1" htmlFor="admin-project-favicon">
                          <span className="label-text">Favicon URL (optional)</span>
                        </label>
                        <input
                          id="admin-project-favicon"
                          type="url"
                          placeholder="https://..."
                          value={activeProject.favicon}
                          onChange={(e) =>
                            setActiveProject((p) => ({ ...p, favicon: e.target.value }))
                          }
                          className="input input-bordered input-sm w-full"
                        />
                      </div>
                    </div>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Categories (select at least one)</legend>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleProjectCategory(cat)}
                          className={`badge badge-sm cursor-pointer transition-all ${
                            activeProject.categories.includes(cat)
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
                    <legend className="fieldset-legend">Store &amp; repo links (optional)</legend>
                    <div className="flex flex-col gap-3">
                      <div className="form-control">
                        <label className="label py-1" htmlFor="admin-project-github">
                          <span className="label-text">GitHub URL</span>
                        </label>
                        <input
                          id="admin-project-github"
                          type="url"
                          placeholder="https://github.com/..."
                          value={activeProject.githubUrl}
                          onChange={(e) =>
                            setActiveProject((p) => ({
                              ...p,
                              githubUrl: e.target.value,
                            }))
                          }
                          className="input input-bordered input-sm w-full"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1" htmlFor="admin-project-appstore">
                          <span className="label-text">App Store</span>
                        </label>
                        <input
                          id="admin-project-appstore"
                          type="url"
                          placeholder="App Store link"
                          value={activeProject.appStoreUrl}
                          onChange={(e) =>
                            setActiveProject((p) => ({
                              ...p,
                              appStoreUrl: e.target.value,
                            }))
                          }
                          className="input input-bordered input-sm w-full"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1" htmlFor="admin-project-playstore">
                          <span className="label-text">Play Store</span>
                        </label>
                        <input
                          id="admin-project-playstore"
                          type="url"
                          placeholder="Play Store link"
                          value={activeProject.playStoreUrl}
                          onChange={(e) =>
                            setActiveProject((p) => ({
                              ...p,
                              playStoreUrl: e.target.value,
                            }))
                          }
                          className="input input-bordered input-sm w-full"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1" htmlFor="admin-project-chromestore">
                          <span className="label-text">Chrome Web Store</span>
                        </label>
                        <input
                          id="admin-project-chromestore"
                          type="url"
                          placeholder="Chrome Web Store link"
                          value={activeProject.chromeStoreUrl}
                          onChange={(e) =>
                            setActiveProject((p) => ({
                              ...p,
                              chromeStoreUrl: e.target.value,
                            }))
                          }
                          className="input input-bordered input-sm w-full"
                        />
                      </div>
                    </div>
                  </fieldset>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setProjectStep("url")}
                      className="btn btn-ghost btn-sm"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={
                        saving || activeProject.categories.length === 0
                      }
                      className="btn btn-primary btn-sm gap-1"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <FolderPlus size={14} />
                      )}
                      {projectModalMode === "add" ? "Create project" : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProjectModal(false)}
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
