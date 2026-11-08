"use client";

import { Project, User } from "@/lib/types";
import { Copy, ExternalLink, Globe, Megaphone, Pencil, Plus, Smartphone, Trash2 } from "lucide-react";
import React from "react";

interface ProjectTableProps {
  projects: Project[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onCopyUrl: (url: string, title: string) => void;
  onCopyBlurb: (project: Project) => void;
  onAddTag: (project: Project) => void;
  onTagClick: (tag: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onOpenAddProject?: () => void;
  user: User | null;
}

export function ProjectTable({
  projects,
  selectedIds,
  onToggleSelect,
  onCopyUrl,
  onCopyBlurb,
  onAddTag,
  onTagClick,
  onEditProject,
  onDeleteProject,
  onOpenAddProject,
  user,
}: ProjectTableProps) {
  const isAdmin = user?.role === "ADMIN" && user?.status === "ACTIVE";
  const canEdit = Boolean(user && user.status === "ACTIVE");

  if (projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto my-12 p-12 bg-white rounded-3xl border border-[#e5eeff] text-center shadow-lg shadow-purple-950/5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#eff4ff] to-[#eaddff] text-[#5e35b1] flex items-center justify-center font-bold text-2xl mb-4 shadow-sm">
          📁
        </div>
        <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30]">
          No projects found in directory
        </h3>
        <p className="text-sm text-[#494453] mt-2 max-w-md mx-auto">
          There are currently no projects matching this category or search filter. Add a new showcase project to start building your directory.
        </p>

        {canEdit && onOpenAddProject && (
          <div className="mt-6">
            <button
              onClick={onOpenAddProject}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5e35b1] text-white text-sm font-semibold hover:bg-[#461599] transition-all shadow-md shadow-purple-950/10 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Project</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="w-full px-4 sm:px-8 py-3 mb-16">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl shadow-purple-950/5 border border-[#e5eeff] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/80 text-[#494453] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-3 px-3 w-10 text-center" scope="col">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-3 font-semibold min-w-[200px]" scope="col">
                  PROJECT & CATEGORY
                </th>
                <th className="py-3 px-3 font-semibold min-w-[200px]" scope="col">
                  LIVE URL
                </th>
                <th className="py-3 px-3 font-semibold min-w-[180px]" scope="col">
                  TECH ARCHITECTURE
                </th>
                <th className="py-3 px-3 font-semibold min-w-[160px]" scope="col">
                  TAGS
                </th>
                <th className="py-3 px-3 text-right font-semibold w-28" scope="col">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eff4ff] text-sm text-[#0b1c30]">
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
                    <td className="py-3.5 px-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelect(proj.id)}
                        className="w-4 h-4 rounded text-[#5e35b1] accent-[#5e35b1] cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 align-middle">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#0b1c30] text-[15px]">
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
                              <Smartphone className="w-3 h-3" />
                            ) : cat === "digital marketing" ? (
                              <Megaphone className="w-3 h-3" />
                            ) : (
                              <Globe className="w-3 h-3" />
                            )}
                            <span>{proj.category || "website"}</span>
                          </span>
                        </div>

                        {proj.description && (
                          <span className="text-[11px] text-[#494453] line-clamp-1 max-w-xs mt-0.5" title={proj.description}>
                            {proj.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-['JetBrains_Mono'] text-xs text-[#461599] hover:underline flex items-center gap-1 group font-medium"
                          title={proj.url}
                        >
                          <span>{truncatedUrl}</span>
                          <ExternalLink className="w-3 h-3 text-[#5e35b1] group-hover:translate-x-0.5 transition-transform" />
                        </a>

                        <button
                          onClick={() => onCopyUrl(proj.url, proj.title)}
                          className="p-1 text-[#494453] hover:text-[#5e35b1] hover:bg-[#e5eeff] rounded-md transition-colors"
                          title="Copy live link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack.length === 0 ? (
                          <span className="text-xs text-[#7b7484] italic">—</span>
                        ) : (
                          proj.techStack.map((tech, idx) => (
                            <span
                              key={idx}
                              onClick={() => onTagClick(tech)}
                              className="px-2 py-0.5 rounded bg-[#e5eeff] text-[#0b1c30] font-['JetBrains_Mono'] text-[11px] font-medium cursor-pointer hover:bg-[#dce9ff] transition-colors"
                            >
                              {tech}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-middle">
                      <div className="flex flex-wrap items-center gap-1">
                        {proj.tags.map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={() => onTagClick(tag)}
                            className="px-2 py-0.5 rounded-full bg-[#eaddff]/60 text-[#461599] text-[11px] font-semibold hover:bg-[#d1bcff] transition-colors"
                          >
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </button>
                        ))}

                        <button
                          onClick={() => onAddTag(proj)}
                          className="px-1.5 py-0.5 rounded-full bg-[#eff4ff] text-[#494453] hover:text-[#0b1c30] hover:bg-[#e5eeff] text-[11px] font-medium flex items-center gap-0.5 border border-[#cbdbf5]/50 transition-colors"
                          title="Add Pitch Tag"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          Tag
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onCopyBlurb(proj)}
                          className="p-1.5 rounded-lg text-[#494453] hover:text-[#5e35b1] hover:bg-[#e5eeff] transition-colors"
                          title="Copy sales pitch blurb"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEditProject(proj)}
                            className="p-1.5 rounded-lg text-[#494453] hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
