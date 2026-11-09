"use client";

import { Project, User } from "@/lib/types";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Megaphone,
  Pencil,
  Smartphone,
  Tag,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";

interface ProjectGridViewProps {
  projects: Project[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onInspectProject: (project: Project) => void;
  onCopyUrl: (url: string, title: string) => void;
  onCopyBlurb: (project: Project) => void;
  onAddTag: (project: Project) => void;
  onTagClick: (tag: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  user: User | null;
}

export function ProjectGridView({
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
  user,
}: ProjectGridViewProps) {
  const isAdmin = user?.role === "ADMIN" && user?.status === "ACTIVE";
  const canEdit = Boolean(user && user.status === "ACTIVE");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getCategoryDetails = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case "mobile app":
        return { icon: Smartphone, label: "Mobile App", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "digital marketing":
        return { icon: Megaphone, label: "Digital Marketing", color: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { icon: Globe, label: "Website", color: "bg-purple-50 text-[#5e35b1] border-purple-200" };
    }
  };

  const handleCopyPitch = (project: Project) => {
    onCopyBlurb(project);
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-16">
      {projects.map((project) => {
        const isSelected = selectedIds.has(project.id);
        const { icon: CatIcon, label: catLabel, color: catColor } = getCategoryDetails(project.category);

        return (
          <div
            key={project.id}
            className={`bg-white rounded-2xl border transition-all shadow-xs flex flex-col justify-between group overflow-hidden ${
              isSelected
                ? "border-[#5e35b1] ring-2 ring-[#5e35b1]/20 shadow-md"
                : "border-[#e5eeff] hover:border-[#cbdbf5] hover:shadow-md"
            }`}
          >
            {/* Card Header */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(project.id)}
                    className="w-4 h-4 rounded text-[#5e35b1] accent-[#5e35b1] cursor-pointer"
                  />
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${catColor}`}
                  >
                    <CatIcon className="w-3 h-3" />
                    <span>{catLabel}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onInspectProject(project)}
                    className="p-1.5 rounded-lg text-[#7b7484] hover:text-[#5e35b1] hover:bg-[#eff4ff] transition-colors"
                    title="Quick Inspect & Pitch Deck"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => onEditProject(project)}
                      className="p-1.5 rounded-lg text-[#7b7484] hover:text-[#5e35b1] hover:bg-[#eff4ff] transition-colors"
                      title="Edit Project"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => onDeleteProject(project)}
                      className="p-1.5 rounded-lg text-[#7b7484] hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Link */}
              <h3
                onClick={() => onInspectProject(project)}
                className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30] hover:text-[#5e35b1] cursor-pointer transition-colors leading-snug line-clamp-1"
                title={project.title}
              >
                {project.title}
              </h3>

              <div className="mt-1.5 flex items-center gap-1.5">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate font-mono max-w-[240px]"
                  title={project.url}
                >
                  <span className="truncate">{project.url.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              {/* Description */}
              <p className="mt-2.5 text-xs text-[#494453] leading-relaxed line-clamp-2">
                {project.description || "Client-ready showcase link."}
              </p>

              {/* Tech Stack Pills */}
              <div className="mt-4 flex-1">
                {project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <button
                        key={tech}
                        onClick={() => onTagClick(tech)}
                        className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#461599] text-[10px] font-medium hover:bg-[#eaddff] transition-colors"
                      >
                        {tech}
                      </button>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-[#7b7484]">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Hashtags */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagClick(tag)}
                        className="px-2 py-0.5 rounded-full bg-[#f8f9ff] border border-[#e5eeff] text-[#7b7484] hover:text-[#5e35b1] text-[10px] font-medium transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-[10px] text-[#7b7484] self-center">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-3 bg-[#f8f9ff] border-t border-[#eff4ff] flex items-center justify-between gap-2">
              <button
                onClick={() => onCopyUrl(project.url, project.title)}
                className="px-3 py-1.5 rounded-xl border border-[#cbdbf5] text-[#494453] hover:text-[#0b1c30] hover:bg-white text-xs font-medium transition-all flex items-center gap-1.5"
                title="Copy URL"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>URL</span>
              </button>

              <button
                onClick={() => handleCopyPitch(project)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-95 ${
                  copiedId === project.id
                    ? "bg-emerald-600 text-white"
                    : "bg-[#5e35b1] text-white hover:bg-[#461599]"
                }`}
              >
                {copiedId === project.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Pitch Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Pitch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
