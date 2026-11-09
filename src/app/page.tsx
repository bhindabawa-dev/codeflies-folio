"use client";

import { AccessDeniedView } from "@/components/AccessDeniedView";
import { AdminForceUpdateModal } from "@/components/AdminForceUpdateModal";
import { AdminImportModal } from "@/components/AdminImportModal";
import { AdminUsersModal } from "@/components/AdminUsersModal";
import { AnonymousGateView } from "@/components/AnonymousGateView";
import { AuthModal } from "@/components/AuthModal";
import { BatchActionBar, CopyFormat } from "@/components/BatchActionBar";
import { ForceUpdateModal } from "@/components/ForceUpdateModal";
import { Header } from "@/components/Header";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { ProjectGridView } from "@/components/ProjectGridView";
import { ProjectModal } from "@/components/ProjectModal";
import { ProjectTable } from "@/components/ProjectTable";
import { CategoryCount, SearchHero } from "@/components/SearchHero";
import { TagModal } from "@/components/TagModal";
import { Toast, ToastData } from "@/components/Toast";
import { exportProjectsToCSV, exportProjectsToExcel } from "@/lib/export";
import { Project, ProjectCategory, User } from "@/lib/types";
import { APP_VERSION } from "@/lib/version";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const CATEGORY_STORAGE_KEY = "codeflies_portfolio_category";
const PROJECTS_STORAGE_KEY = "codeflies_portfolio_projects_backup";

export default function PortfolioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [hasLocalBackup, setHasLocalBackup] = useState(false);

  // Search, Category & Filter state (persistent category selection)
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals & UI
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminImportOpen, setIsAdminImportOpen] = useState(false);
  const [isAdminForceUpdateOpen, setIsAdminForceUpdateOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [tagModalProject, setTagModalProject] = useState<Project | null>(null);
  const [inspectingProject, setInspectingProject] = useState<Project | null>(null);

  // Force Update State (Real-time lockout when admin triggers update)
  const [isForceUpdateRequired, setIsForceUpdateRequired] = useState(false);
  const [targetForceVersion, setTargetForceVersion] = useState(APP_VERSION);
  const [forceUpdateMessage, setForceUpdateMessage] = useState("");
  const [forceTimestamp, setForceTimestamp] = useState(0);

  // Real-time system version & forced update checker
  const checkSystemVersion = useCallback(async () => {
    try {
      const res = await fetch("/api/system/version", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data.forceTimestamp && data.forceTimestamp > 0) {
        let acknowledgedTs = 0;
        try {
          acknowledgedTs =
            Number(localStorage.getItem("codeflies_acknowledged_update_ts")) || 0;
        } catch {
          // Ignore
        }

        const isOutdated =
          data.forceTimestamp > acknowledgedTs ||
          (data.currentVersion && data.currentVersion !== APP_VERSION);

        if (isOutdated) {
          setTargetForceVersion(data.currentVersion || APP_VERSION);
          setForceUpdateMessage(data.message || "");
          setForceTimestamp(data.forceTimestamp);
          setIsForceUpdateRequired(true);
        }
      }
    } catch {
      // Ignore network glitches
    }
  }, []);

  // Background heartbeat listener for instant force updates across all open tabs
  useEffect(() => {
    checkSystemVersion();
    const interval = setInterval(checkSystemVersion, 15000);
    window.addEventListener("focus", checkSystemVersion);
    document.addEventListener("visibilitychange", checkSystemVersion);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkSystemVersion);
      document.removeEventListener("visibilitychange", checkSystemVersion);
    };
  }, [checkSystemVersion]);

  // Load saved category state from localStorage so it never defaults away from user choice
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (
        saved &&
        ["all", "website", "mobile app", "digital marketing"].includes(saved.toLowerCase().trim())
      ) {
        setSelectedCategory(saved.toLowerCase().trim());
      }
      const savedView = localStorage.getItem("codeflies_portfolio_view_mode");
      if (savedView === "grid" || savedView === "table") {
        setViewMode(savedView);
      }
    } catch {
      // Ignore localStorage issues
    }
  }, []);

  const handleCategoryChange = (category: string) => {
    const clean = category.toLowerCase().trim();
    setSelectedCategory(clean);
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, clean);
    } catch {
      // Ignore
    }
  };

  const handleViewModeChange = (mode: "table" | "grid") => {
    setViewMode(mode);
    try {
      localStorage.setItem("codeflies_portfolio_view_mode", mode);
    } catch {
      // Ignore
    }
  };

  const handleExportExcel = () => {
    const targetProjects =
      selectedIds.size > 0
        ? filteredProjects.filter((p) => selectedIds.has(p.id))
        : filteredProjects;

    if (targetProjects.length === 0) {
      showToast("No Projects", "There are no projects to export.", "info");
      return;
    }

    const success = exportProjectsToExcel(
      targetProjects,
      `codeflies_portfolio_${selectedCategory}_${Date.now()}.xlsx`
    );
    if (success) {
      showToast(
        "Excel Exported",
        `Exported ${targetProjects.length} projects to Excel spreadsheet (.xlsx)`,
        "success"
      );
    }
  };

  const handleExportCSV = () => {
    const targetProjects =
      selectedIds.size > 0
        ? filteredProjects.filter((p) => selectedIds.has(p.id))
        : filteredProjects;

    if (targetProjects.length === 0) {
      showToast("No Projects", "There are no projects to export.", "info");
      return;
    }

    const success = exportProjectsToCSV(
      targetProjects,
      `codeflies_portfolio_${selectedCategory}_${Date.now()}.csv`
    );
    if (success) {
      showToast(
        "CSV Exported",
        `Exported ${targetProjects.length} projects to CSV file (.csv)`,
        "success"
      );
    }
  };

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
        if (data.projects.length > 0) {
          setProjects(data.projects);
          try {
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(data.projects));
            setHasLocalBackup(true);
          } catch {}
          const allIds = new Set<string>(data.projects.map((p: Project) => p.id));
          setSelectedIds(allIds);
        } else {
          // If server returned 0 projects, check if client has resilient local storage backup
          let localBackup: Project[] = [];
          try {
            const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (raw) localBackup = JSON.parse(raw);
          } catch {}

          if (localBackup.length > 0) {
            setProjects(localBackup);
            setHasLocalBackup(true);
            setSelectedIds(new Set(localBackup.map((p) => p.id)));
            showToast(
              "Restored from Local Backup",
              `Recovered ${localBackup.length} projects from browser storage. Synchronizing to server...`,
              "info"
            );
            // Re-sync back to server in background so serverless container has them
            try {
              fetch("/api/projects/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projects: localBackup }),
              }).catch(() => {});
            } catch {}
          } else {
            setProjects([]);
            setHasLocalBackup(false);
          }
        }
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

  // Extract unique tags and tech stacks
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.tags.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [projects]);

  const availableTechStacks = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.techStack.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [projects]);

  // Category counts
  const categoryCounts: CategoryCount = useMemo(() => {
    let websiteCount = 0;
    let mobileCount = 0;
    let marketingCount = 0;

    projects.forEach((p) => {
      const c = (p.category || "website").toLowerCase().trim();
      if (c === "mobile app") mobileCount++;
      else if (c === "digital marketing") marketingCount++;
      else websiteCount++;
    });

    return {
      all: projects.length,
      website: websiteCount,
      "mobile app": mobileCount,
      "digital marketing": marketingCount,
    };
  }, [projects]);

  // Client-side fuzzy filter respecting persistent category & search
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Category Filter
      if (selectedCategory !== "all") {
        const pCat = (p.category || "website").toLowerCase().trim();
        if (pCat !== selectedCategory.toLowerCase().trim()) {
          return false;
        }
      }

      // 2. Active Tag Preset Filter
      const f = activeFilter.toLowerCase().trim();
      if (f) {
        const matchesFilter =
          p.tags.some(
            (t) =>
              t.toLowerCase() === f ||
              t.toLowerCase() === `#${f}` ||
              t.toLowerCase().replace("#", "") === f.replace("#", "")
          ) ||
          p.techStack.some((t) => t.toLowerCase() === f);

        if (!matchesFilter) return false;
      }

      // 3. Search Query Filter
      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          p.title.toLowerCase().includes(q) ||
          p.url.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          p.techStack.some((t) => t.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [projects, selectedCategory, searchTerm, activeFilter]);

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
          .map((p, i) => `${i + 1}. *${p.title}* [${p.category || "Website"}]\n   🔗 ${p.url}\n   ⚡ Stack: ${p.techStack.join(", ")}`)
          .join("\n\n") +
        `\n\n_Feel free to click through each live demo!_`;
    } else if (format === "markdown") {
      text =
        `### Codeflies Relevant Case Studies\n\n` +
        selectedRows
          .map((p) => `- **[${p.title}](${p.url})** *(${p.category || "Website"})* — *${p.techStack.join(", ")}*`)
          .join("\n");
    } else if (format === "email") {
      text =
        `Hi there,\n\nHere are the relevant verified links from our portfolio that match your requirements:\n\n` +
        selectedRows
          .map((p) => `• ${p.title} [${p.category || "Website"}] (${p.techStack.join(", ")}): ${p.url}`)
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
    category: ProjectCategory | string;
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

      setProjects((prev) => {
        const next = prev.map((p) => (p.id === data.id ? resData.project : p));
        try {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
          setHasLocalBackup(true);
        } catch {}
        return next;
      });
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

      setProjects((prev) => {
        const next = [resData.project, ...prev];
        try {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
          setHasLocalBackup(true);
        } catch {}
        return next;
      });
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

      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== project.id);
        try {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
          if (next.length === 0) setHasLocalBackup(false);
        } catch {}
        return next;
      });
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

  const handleRestoreBackup = async () => {
    try {
      const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!raw) {
        showToast("No Backup Found", "No previous projects found in browser storage.", "info");
        return;
      }
      const backup: Project[] = JSON.parse(raw);
      if (backup.length === 0) {
        showToast("Backup Empty", "No projects stored in backup.", "info");
        return;
      }

      setProjects(backup);
      setSelectedIds(new Set(backup.map((p) => p.id)));
      setHasLocalBackup(true);

      // Sync to server
      const res = await fetch("/api/projects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: backup }),
      });
      if (res.ok) {
        showToast("Backup Restored", `Restored ${backup.length} projects and synced to server!`, "success");
      } else {
        showToast("Restored in Browser", `Loaded ${backup.length} projects from local storage.`, "info");
      }
    } catch {
      showToast("Restore Error", "Could not restore projects from local storage.", "warning");
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
        onOpenImport={() => setIsAdminImportOpen(true)}
        onOpenForceUpdate={() => setIsAdminForceUpdateOpen(true)}
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
            {/* Dynamic Search Hero (Transitions to thin top bar as soon as user types) */}
            <SearchHero
              searchTerm={searchTerm}
              onSearchChange={(val) => {
                setSearchTerm(val);
                if (val && activeFilter) setActiveFilter("");
              }}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              categoryCounts={categoryCounts}
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
              availableTechStacks={availableTechStacks}
              totalResultsCount={filteredProjects.length}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />

            {/* Sticky Batch Multi-Copy & Export Bar */}
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
              onExportExcel={handleExportExcel}
              onExportCSV={handleExportCSV}
            />

            {/* View Mode Switcher: Table View or Modern Card Grid View */}
            {viewMode === "grid" ? (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-2">
                <ProjectGridView
                  projects={filteredProjects}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onInspectProject={(proj) => setInspectingProject(proj)}
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
              </div>
            ) : (
              <ProjectTable
                projects={filteredProjects}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onInspectProject={(proj) => setInspectingProject(proj)}
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
                onOpenAddProject={() => {
                  setEditingProject(null);
                  setIsProjectModalOpen(true);
                }}
                onOpenImport={() => setIsAdminImportOpen(true)}
                onRestoreBackup={handleRestoreBackup}
                hasBackup={hasLocalBackup}
                user={user}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        project={editingProject}
        existingTechStacks={availableTechStacks}
        existingTags={availableTags}
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

      {/* Quick View & Sales Pitch Drawer */}
      <ProjectDrawer
        isOpen={Boolean(inspectingProject)}
        project={inspectingProject}
        onClose={() => setInspectingProject(null)}
        onEdit={(proj) => {
          setEditingProject(proj);
          setIsProjectModalOpen(true);
        }}
        onDelete={handleDeleteProject}
        onTagClick={(tag) => {
          setSearchTerm(tag);
          showToast("Filter Injected", `Filtering by: ${tag}`, "info");
        }}
        onToast={showToast}
        user={user}
      />

      <AdminUsersModal
        isOpen={isAdminOpen}
        currentUser={user}
        onOpenImport={() => setIsAdminImportOpen(true)}
        onClose={() => setIsAdminOpen(false)}
        onToast={showToast}
      />

      {/* Admin Excel / CSV Spreadsheet Importer */}
      <AdminImportModal
        isOpen={isAdminImportOpen}
        onClose={() => setIsAdminImportOpen(false)}
        onSuccess={() => fetchProjects()}
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

      {/* Admin Broadcast Force Update Modal */}
      <AdminForceUpdateModal
        isOpen={isAdminForceUpdateOpen}
        onClose={() => setIsAdminForceUpdateOpen(false)}
        onSuccess={() => checkSystemVersion()}
        onToast={showToast}
      />

      {/* Mandatory Blocking Screen for all users when an update is forced */}
      <ForceUpdateModal
        isOpen={isForceUpdateRequired}
        targetVersion={targetForceVersion}
        updateMessage={forceUpdateMessage}
        forceTimestamp={forceTimestamp}
      />

      {/* Footer */}
      <footer className="w-full bg-white shadow-[0_-1px_12px_rgba(94,53,177,0.06)] border-t border-[#eff4ff] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#494453]">
          <div className="text-center sm:text-left">
            © Codeflies • Portfolio Showcase & Link Directory
          </div>
          <div className="font-['JetBrains_Mono'] text-[11px] text-[#7b7484] flex items-center gap-1.5">
            <span>folio.codeflies.com</span>
            <span>•</span>
            <span className="font-semibold text-[#5e35b1]">{APP_VERSION}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
