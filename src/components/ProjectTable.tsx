"use client";

import { Project, User } from "@/lib/types";
import {
  Copy,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Globe,
  Megaphone,
  Pencil,
  Plus,
  RotateCcw,
  Smartphone,
  Trash2,
} from "lucide-react";
import React from "react";

interface ProjectTableProps {
  projects: Project[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onInspectProject?: (project: Project) => void;
  onCopyUrl: (url: string, title: string) => void;
  onCopyBlurb: (project: Project) => void;
  onAddTag: (project: Project) => void;
  onTagClick: (tag: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onOpenAddProject?: () => void;
  onOpenImport?: () => void;
  onRestoreBackup?: () => void;
  hasBackup?: boolean;
  user: User | null;
}

export function ProjectTable({
  projects,
  selectedIds,
  onToggleSelect,
  onInspectProject,
  onCopyUrl,
  onCopyBlurb,
  onAddTag,
  onTagClick,
  onEditProject,
  onDeleteProject,
  onOpenAddProject,
  onOpenImport,
  onRestoreBackup,
  hasBackup,
  user,
}: ProjectTableProps) {
  const isAdmin = user?.role === "ADMIN" && user?.status === "ACTIVE";
  const canEdit = Boolean(user && user.status === "ACTIVE");

  if (projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto my-8 p-10 bg-white rounded-3xl border border-[#e5eeff] text-center shadow-lg shadow-purple-950/5">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#eff4ff] to-[#eaddff] text-[#5e35b1] flex items-center justify-center font-bold text-xl mb-3 shadow-sm">
          📁
        </div>
        <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
          No projects found in directory
        </h3>
        <p className="text-xs text-[#494453] mt-1.5 max-w-md mx-auto">
          Add projects, restore from local backup, or import an Excel spreadsheet to populate your portfolio links.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {hasBackup && onRestoreBackup && (
            <button
              onClick={onRestoreBackup}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[#5e35b1] text-xs font-semibold hover:bg-purple-100 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore from Browser Backup</span>
            </button>
          )}

          {isAdmin && onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import Excel Spreadsheet</span>
            </button>
          )}

          {canEdit && onOpenAddProject && (
            <button
              onClick={onOpenAddProject}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5e35b1] text-white text-xs font-semibold hover:bg-[#461599] transition-all shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Single Project</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="w-full px-4 sm:px-8 py-2 mb-12">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg shadow-purple-950/5 border border-[#e5eeff] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/80 text-[#494453] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-2.5 px-3 w-10 text-center" scope="col">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[200px]" scope="col">
                  PROJECT & CATEGORY
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[180px]" scope="col">
                  LIVE URL
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[160px]" scope="col">
                  TECH ARCHITECTURE
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[160px]" scope="col">
                  TAGS
                </th>
                <th className="py-2.5 px-3 text-right font-semibold w-32" scope="col">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eff4ff] text-xs sm:text-sm text-[#0b1c30]">
              {projects.map((proj) => {
                const isChecked = selectedIds.has(proj.id);
                const displayUrl = proj.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
                const truncatedUrl =
                  displayUrl.length > 28 ? `${displayUrl.slice(0, 26)}...` : displayUrl;
                const cat = (proj.category || "website").toLowerCase();

                return (
                  <tr
                    key={proj.id}
                    className={`transition-colors hover:bg-[#eff4ff]/50 ${
                      isChecked ? "bg-[#eff4ff]/30" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelect(proj.id)}
                        className="w-4 h-4 rounded text-[#5e35b1] accent-[#5e35b1] cursor-pointer"
                      />
                    </td>

                    <td className="py-2.5 px-3 align-middle">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => onInspectProject?.(proj)}
                            className="font-['Plus_Jakarta_Sans'] font-bold text-[#0b1c30] text-[14px] hover:text-[#5e35b1] cursor-pointer transition-colors"
                            title="Click to inspect pitch"
                          >
                            {proj.title}
                          </span>

                          {/* Category Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                              cat === "mobile app"
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : cat === "digital marketing"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {cat === "mobile app" ? (
                              <Smartphone className="w-2.5 h-2.5" />
                            ) : cat === "digital marketing" ? (
                              <Megaphone className="w-2.5 h-2.5" />
                            ) : (
                              <Globe className="w-2.5 h-2.5" />
                            )}
                            <span>{proj.category || "website"}</span>
                          </span>
                        </div>

                        {proj.description && (
                          <span className="text-xs text-[#494453] line-clamp-1 max-w-sm mt-0.5">
                            {proj.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-[#461599] hover:underline flex items-center gap-1 truncate max-w-[200px]"
                          title={proj.url}
                        >
                          <span className="truncate">{truncatedUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                        <button
                          onClick={() => onCopyUrl(proj.url, proj.title)}
                          className="p-1 text-[#494453] hover:text-[#5e35b1] rounded hover:bg-[#eff4ff] transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 align-middle">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {proj.techStack && proj.techStack.length > 0 ? (
                          proj.techStack.map((tech) => (
                            <button
                              key={tech}
                              onClick={() => onTagClick(tech)}
                              className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#461599] font-['JetBrains_Mono'] text-[11px] font-medium hover:bg-[#eaddff] transition-colors"
                            >
                              {tech}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-[#7b7484] italic">—</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 align-middle">
                      <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                        {proj.tags && proj.tags.length > 0 ? (
                          proj.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => onTagClick(tag)}
                              className="px-2 py-0.5 rounded-full bg-[#f8f9ff] text-[#5e35b1] text-xs font-medium hover:bg-[#eaddff] transition-colors border border-[#e5eeff]"
                            >
                              {tag}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-[#7b7484] italic">—</span>
                        )}
                        <button
                          onClick={() => onAddTag(proj)}
                          className="px-1.5 py-0.5 rounded text-[10px] text-[#7b7484] hover:text-[#5e35b1] hover:bg-[#eff4ff] border border-dashed border-[#cbdbf5] transition-colors"
                          title="Add Tag"
                        >
                          + Tag
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right align-middle">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick View / Inspect Drawer */}
                        {onInspectProject && (
                          <button
                            onClick={() => onInspectProject(proj)}
                            className="p-1.5 rounded-lg text-[#7b7484] hover:text-[#5e35b1] hover:bg-[#eff4ff] transition-colors"
                            title="Quick View & Pitch Deck"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onCopyBlurb(proj)}
                          className="p-1.5 rounded-lg text-[#494453] hover:text-[#5e35b1] hover:bg-[#eff4ff] transition-colors"
                          title="Copy Full Pitch"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEditProject(proj)}
                            className="p-1.5 rounded-lg text-[#494453] hover:text-[#5e35b1] hover:bg-[#eff4ff] transition-colors"
                            title="Edit Project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => onDeleteProject(proj)}
                            className="p-1.5 rounded-lg text-[#494453] hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Project (Admin only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
