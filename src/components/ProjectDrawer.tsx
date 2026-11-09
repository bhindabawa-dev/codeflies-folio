"use client";

import { Project, User } from "@/lib/types";
import {
  Calendar,
  Check,
  Code,
  Copy,
  ExternalLink,
  Globe,
  Hash,
  Layers,
  Mail,
  Megaphone,
  MessageSquare,
  Pencil,
  Smartphone,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface ProjectDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onTagClick?: (tag: string) => void;
  onToast: (title: string, subtitle?: string, type?: "success" | "info" | "warning") => void;
  user: User | null;
}

export function ProjectDrawer({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTagClick,
  onToast,
  user,
}: ProjectDrawerProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const isAdmin = user?.role === "ADMIN" && user?.status === "ACTIVE";
  const canEdit = Boolean(user && user.status === "ACTIVE");

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "mobile app":
        return Smartphone;
      case "digital marketing":
        return Megaphone;
      default:
        return Globe;
    }
  };

  const CategoryIcon = getCategoryIcon(project.category);

  // Pitches
  const whatsappPitch = `🚀 *${project.title}* (${project.category || "Website"})
🔗 ${project.url}

💡 *Overview:* ${project.description || "Client-ready enterprise showcase."}

🛠 *Tech Stack:* ${project.techStack.length > 0 ? project.techStack.join(", ") : "Modern Web Stack"}
🏷 ${project.tags.join(" ")}

_Delivered by Codeflies Technologies_`;

  const emailPitch = `Project Showcase: ${project.title}
Live Link: ${project.url}
Category: ${project.category || "Website"}
Summary: ${project.description || "Client-ready enterprise showcase."}
Technologies: ${project.techStack.join(", ") || "Standard Web Stack"}
Tags: ${project.tags.join(" ")}`;

  const markdownDeck = `- [**${project.title}**](${project.url}) — ${project.description || ""} (${project.techStack.join(", ")})`;

  const handleCopy = (text: string, typeName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(typeName);
    onToast("Copied to Clipboard", `${typeName} copied successfully.`, "success");
    setTimeout(() => setCopiedType(null), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#e5eeff] flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#eff4ff] flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#eff4ff] text-[#5e35b1] border border-[#cbdbf5] flex items-center gap-1.5 uppercase tracking-wide">
              <CategoryIcon className="w-3.5 h-3.5" />
              <span>{project.category || "website"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
                className="p-1.5 rounded-lg text-[#494453] hover:text-[#5e35b1] hover:bg-[#eff4ff] transition-colors"
                title="Edit Project"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}

            {isAdmin && onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(project);
                }}
                className="p-1.5 rounded-lg text-[#494453] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#494453] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Live URL */}
          <div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0b1c30] leading-tight">
              {project.title}
            </h2>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors max-w-full truncate"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{project.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0 ml-0.5" />
              </a>

              <button
                onClick={() => handleCopy(project.url, "URL")}
                className="px-2.5 py-1.5 rounded-xl border border-[#cbdbf5] text-[#494453] hover:text-[#0b1c30] text-xs font-medium hover:bg-[#f8f9ff] transition-colors flex items-center gap-1"
                title="Copy Live URL"
              >
                {copiedType === "URL" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === "URL" ? "Copied" : "Copy URL"}</span>
              </button>
            </div>
          </div>

          {/* Project Summary */}
          <div>
            <h4 className="text-xs font-bold text-[#7b7484] uppercase tracking-wider mb-2">
              Showcase Description & Pitch
            </h4>
            <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] text-sm text-[#0b1c30] leading-relaxed">
              {project.description || "No specific blurb provided for this project."}
            </div>
          </div>

          {/* Tech Architecture Stack */}
          <div>
            <h4 className="text-xs font-bold text-[#7b7484] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-[#5e35b1]" />
              Tech Stack Architecture ({project.techStack.length})
            </h4>
            {project.techStack.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => {
                      if (onTagClick) {
                        onTagClick(tech);
                        onClose();
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-[#0b1c30] border border-[#cbdbf5] hover:border-[#5e35b1] hover:text-[#5e35b1] transition-colors shadow-2xs"
                  >
                    {tech}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#7b7484] italic">No technologies specified</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-xs font-bold text-[#7b7484] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#5e35b1]" />
              Discovery Hashtags ({project.tags.length})
            </h4>
            {project.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (onTagClick) {
                        onTagClick(tag);
                        onClose();
                      }
                    }}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eaddff]/60 text-[#461599] hover:bg-[#d1bcff] transition-colors shadow-2xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#7b7484] italic">No hashtags attached</p>
            )}
          </div>

          {/* Quick Pitch Copy Deck */}
          <div className="pt-2 border-t border-[#eff4ff]">
            <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-3">
              1-Click Pitch Formats for BDMs
            </h4>

            <div className="space-y-2.5">
              {/* WhatsApp Pitch */}
              <div className="p-3.5 rounded-xl border border-[#cbdbf5] hover:border-[#25D366] transition-all bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp Sales Pitch
                  </span>
                  <button
                    onClick={() => handleCopy(whatsappPitch, "WhatsApp Pitch")}
                    className="px-2.5 py-1 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    {copiedType === "WhatsApp Pitch" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === "WhatsApp Pitch" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-sans text-[#494453] bg-[#f8f9ff] p-2.5 rounded-lg whitespace-pre-wrap line-clamp-3">
                  {whatsappPitch}
                </pre>
              </div>

              {/* Email Proposal */}
              <div className="p-3.5 rounded-xl border border-[#cbdbf5] hover:border-[#5e35b1] transition-all bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#5e35b1]" /> Client Email Snippet
                  </span>
                  <button
                    onClick={() => handleCopy(emailPitch, "Email Snippet")}
                    className="px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#5e35b1] hover:bg-[#eaddff] text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    {copiedType === "Email Snippet" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === "Email Snippet" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-sans text-[#494453] bg-[#f8f9ff] p-2.5 rounded-lg whitespace-pre-wrap line-clamp-3">
                  {emailPitch}
                </pre>
              </div>

              {/* Markdown Link */}
              <div className="p-3.5 rounded-xl border border-[#cbdbf5] hover:border-gray-400 transition-all bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-[#494453]" /> Markdown Proposal Deck
                  </span>
                  <button
                    onClick={() => handleCopy(markdownDeck, "Markdown")}
                    className="px-2.5 py-1 rounded-lg border border-[#cbdbf5] text-[#494453] hover:text-[#0b1c30] text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    {copiedType === "Markdown" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === "Markdown" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <code className="text-[11px] font-mono text-[#494453] bg-[#f8f9ff] p-2 rounded-lg block truncate">
                  {markdownDeck}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer timestamp */}
        <div className="px-6 py-3 border-t border-[#eff4ff] bg-[#f8f9ff] flex items-center justify-between text-[11px] text-[#7b7484]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Added: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Active"}
          </span>
          <span className="font-mono text-[10px]">ID: {project.id.slice(0, 10)}...</span>
        </div>
      </div>
    </div>
  );
}
