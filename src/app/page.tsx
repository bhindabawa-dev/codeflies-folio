"use client";

import { AccessDeniedView } from "@/components/AccessDeniedView";
import { AdminUsersModal } from "@/components/AdminUsersModal";
import { AnonymousGateView } from "@/components/AnonymousGateView";
import { AuthModal } from "@/components/AuthModal";
import { BatchActionBar, CopyFormat } from "@/components/BatchActionBar";
import { Header } from "@/components/Header";
import { ProjectModal } from "@/components/ProjectModal";
import { ProjectTable } from "@/components/ProjectTable";
import { SearchHero } from "@/components/SearchHero";
import { TagModal } from "@/components/TagModal";
import { Toast, ToastData } from "@/components/Toast";
import { Project, User } from "@/lib/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function PortfolioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals & UI
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [tagModalProject, setTagModalProject] = useState<Project | null>(null);

  const showToast = useCallback(
    (title: string, subtitle?: string, type?: "success" | "info" | "warning") => {
      setToast({ title, subtitle, type });
      setTimeout(() => {
        setToast((current) => (current?.title === title ? null : current));
      }, 3400);
    },
    []
  );

  // Fetch Session
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setGoogleConfigured(Boolean(data.googleConfigured));
        return data.user as User | null;
      }
    } catch {
      console.warn("Could not fetch current session");
    }
    return null;
  }, []);

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();

      if (res.status === 401) {
        setProjects([]);
        setAccessDenied(false);
        return;
      }

      if (res.status === 403) {
        setAccessDenied(true);
        if (data.user) setUser(data.user);
        return;
      }

      setAccessDenied(false);
      if (res.ok && Array.isArray(data.projects)) {
        setProjects(data.projects);
        // By default select all for immediate high-speed multicopy
        const allIds = new Set<string>(data.projects.map((p: Project) => p.id));
        setSelectedIds(allIds);
      }
    } catch {
      showToast("Connection Error", "Could not fetch project directory", "warning");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSession().then((currentUser) => {
      if (currentUser && currentUser.status === "ACTIVE") {
        fetchProjects();
      } else {
        setLoading(false);
      }
    });
  }, [fetchSession, fetchProjects]);

  // Extract unique tags for quick preset pill bar
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.tags.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [projects]);

  // Super fast client-side fuzzy filter
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const f = activeFilter.toLowerCase().trim();

      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.url.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      const matchesFilter =
        !f ||
        p.tags.some(
          (t) =>
            t.toLowerCase() === f ||
            t.toLowerCase() === `#${f}` ||
            t.toLowerCase().replace("#", "") === f.replace("#", "")
        ) ||
        p.techStack.some((t) => t.toLowerCase().includes(f));

      return matchesSearch && matchesFilter;
    });
  }, [projects, searchTerm, activeFilter]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length && filteredProjects.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
    }
  };

  // Keyboard shortcut: C for copy all, A for toggle select all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((document.activeElement as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "c" || e.key === "C") {
        if (selectedIds.size > 0) {
          handleCopyAll("whatsapp");
        }
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleToggleSelectAll();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, filteredProjects]);

  // Batch Multi-copy Formatter
  const handleCopyAll = (format: CopyFormat) => {
    const selectedRows = projects.filter((p) => selectedIds.has(p.id));

    if (selectedRows.length === 0) {
      showToast("No projects selected", "Please check at least one project row.", "info");
      return;
    }

    let text = "";
    if (format === "whatsapp") {
      text =
        `🚀 *Codeflies Portfolio Samples for Your Review*\n\n` +
        selectedRows
          .map((p, i) => `${i + 1}. *${p.title}* \n   🔗 ${p.url}\n   ⚡ Stack: ${p.techStack.join(", ")}`)
          .join("\n\n") +
        `\n\n_Feel free to click through each live demo!_`;
    } else if (format === "markdown") {
      text =
        `### Codeflies Relevant Case Studies\n\n` +
        selectedRows
          .map((p) => `- **[${p.title}](${p.url})** — *${p.techStack.join(", ")}*`)
          .join("\n");
    } else if (format === "email") {
      text =
        `Hi there,\n\nHere are the relevant verified links from our portfolio that match your tech stack:\n\n` +
        selectedRows
          .map((p) => `• ${p.title} (${p.techStack.join(", ")}): ${p.url}`)
          .join("\n") +
        `\n\nLet me know if you would like an architect walkthrough!`;
    } else {
      text = selectedRows.map((p) => p.url).join("\n");
    }

    navigator.clipboard.writeText(text).then(() => {
      showToast(
        `Copied ${selectedRows.length} Portfolio Links!`,
        `Formatted for ${format.toUpperCase()} sharing`,
        "success"
      );
    });
  };

  // Single URL copy
  const handleCopyUrl = (url: string, title: string) => {
    navigator.clipboard.writeText(url).then(() => {
      showToast("Link Copied", `${title}: ${url}`, "success");
    });
  };

  // Single sales blurb copy
  const handleCopyBlurb = (project: Project) => {
    const blurb =
      project.description ||
      `${project.title}: Enterprise showcase live at ${project.url} (${project.techStack.join(", ")})`;
    navigator.clipboard.writeText(blurb).then(() => {
      showToast("Sales Pitch Blurb Copied", "Ready to paste into proposals or client chats.", "success");
    });
  };

  // Project CRUD Actions
  const handleSaveProject = async (data: {
    id?: string;
    title: string;
    url: string;
    description: string;
    techStack: string[];
    tags: string[];
  }) => {
    if (data.id) {
      // Edit
      const res = await fetch(`/api/projects/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update project");

      setProjects((prev) =>
        prev.map((p) => (p.id === data.id ? resData.project : p))
      );
      showToast("Project Updated", `Changes saved for "${data.title}".`, "success");
    } else {
      // Add
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to add project");

      setProjects((prev) => [resData.project, ...prev]);
      setSelectedIds((prev) => new Set([resData.project.id, ...Array.from(prev)]));
      showToast("Project Added", `"${data.title}" added to directory.`, "success");
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}" from the portfolio?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete project");

      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(project.id);
        return next;
      });
      showToast("Project Deleted", `"${project.title}" was removed.`, "info");
    } catch (err: unknown) {
      showToast("Delete Failed", err instanceof Error ? err.message : "Error", "warning");
    }
  };

  // Inline Tag Add
  const handleSaveTag = async (projectId: string, tag: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    if (target.tags.includes(tag)) {
      showToast("Tag Already Exists", `"${tag}" is already attached.`, "info");
      return;
    }

    const updatedTags = [...target.tags, tag];
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: updatedTags }),
    });

    const resData = await res.json();
    if (!res.ok) {
      showToast("Tag Failed", resData.error || "Could not attach tag", "warning");
      return;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, tags: updatedTags } : p))
    );
    showToast("Tag Attached", `Attached ${tag} to ${target.title}`, "success");
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProjects([]);
    setSelectedIds(new Set());
    showToast("Signed Out", "You have been logged out.", "info");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff]">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* App Header */}
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAddProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-16">
        {loading ? (
          <div className="max-w-7xl mx-auto my-24 text-center text-sm text-[#494453]">
            <div className="inline-block w-8 h-8 border-2 border-[#5e35b1] border-t-transparent rounded-full animate-spin mb-3"></div>
            <div>Loading portfolio repository...</div>
          </div>
        ) : !user ? (
          <AnonymousGateView
            onOpenAuth={() => setIsAuthOpen(true)}
            googleConfigured={googleConfigured}
          />
        ) : accessDenied || user.status !== "ACTIVE" ? (
          <AccessDeniedView
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
          />
        ) : (
          <>
            {/* Hero Search Section */}
            <SearchHero
              searchTerm={searchTerm}
              onSearchChange={(val) => {
                setSearchTerm(val);
                if (val && activeFilter) setActiveFilter("");
              }}
              activeFilter={activeFilter}
              onFilterSelect={(tag) => {
                if (activeFilter.toLowerCase() === tag.toLowerCase()) {
                  setActiveFilter("");
                } else {
                  setActiveFilter(tag);
                  setSearchTerm("");
                  showToast("Filter Applied", `Showing portfolio matching "${tag}"`, "info");
                }
              }}
              availableTags={availableTags}
            />

            {/* Sticky Batch Multi-Copy Bar */}
            <BatchActionBar
              totalCount={filteredProjects.length}
              selectedCount={filteredProjects.filter((p) => selectedIds.has(p.id)).length}
              isAllSelected={
                filteredProjects.length > 0 &&
                filteredProjects.every((p) => selectedIds.has(p.id))
              }
              onToggleSelectAll={handleToggleSelectAll}
              onCopyAll={handleCopyAll}
              onClearSelection={() => setSelectedIds(new Set())}
            />

            {/* Futuristic Tabular Directory Table */}
            <ProjectTable
              projects={filteredProjects}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onCopyUrl={handleCopyUrl}
              onCopyBlurb={handleCopyBlurb}
              onAddTag={(proj) => setTagModalProject(proj)}
              onTagClick={(tag) => {
                setSearchTerm(tag);
                showToast("Search Filter Injected", `Searching for: ${tag}`, "info");
              }}
              onEditProject={(proj) => {
                setEditingProject(proj);
                setIsProjectModalOpen(true);
              }}
              onDeleteProject={handleDeleteProject}
              user={user}
            />
          </>
        )}
      </main>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        project={editingProject}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
      />

      <TagModal
        isOpen={Boolean(tagModalProject)}
        project={tagModalProject}
        onClose={() => setTagModalProject(null)}
        onSaveTag={handleSaveTag}
      />

      <AdminUsersModal
        isOpen={isAdminOpen}
        currentUser={user}
        onClose={() => setIsAdminOpen(false)}
        onToast={showToast}
      />

      <AuthModal
        isOpen={isAuthOpen}
        currentUser={user}
        googleConfigured={googleConfigured}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          if (loggedUser.status === "ACTIVE") {
            fetchProjects();
          }
        }}
        onToast={showToast}
      />

      {/* Footer */}
      <footer className="w-full bg-white shadow-[0_-1px_12px_rgba(94,53,177,0.06)] border-t border-[#eff4ff] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#494453]">
          <div className="text-center sm:text-left">
            © Codeflies • Portfolio Showcase & Link Directory
          </div>
          <div className="font-['JetBrains_Mono'] text-[11px] text-[#7b7484]">
            folio.codeflies.com
          </div>
        </div>
      </footer>
    </div>
  );
}
