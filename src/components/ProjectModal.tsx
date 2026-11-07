"use client";

import { Project } from "@/lib/types";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    url: string;
    description: string;
    techStack: string[];
    tags: string[];
  }) => Promise<void>;
}

export function ProjectModal({
  isOpen,
  project,
  onClose,
  onSave,
}: ProjectModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setUrl(project.url);
      setDescription(project.description || "");
      setTechStackInput(project.techStack.join(", "));
      setTagsInput(project.tags.join(", "));
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
      setTechStackInput("");
      setTagsInput("");
    }
    setError("");
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setError("Project title and URL are required.");
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    const techStack = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(",")
      .map((t) => {
        const trimmed = t.trim();
        return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
      })
      .filter(Boolean);

    try {
      setSaving(true);
      setError("");
      await onSave({
        id: project?.id,
        title: title.trim(),
        url: finalUrl,
        description: description.trim() || `${title.trim()}: Live at ${finalUrl}`,
        techStack,
        tags,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#e5eeff] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#eff4ff] flex items-center justify-between">
          <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
            {project ? "Edit Portfolio Project" : "Add New Portfolio Project"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#494453] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Project Name / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. PayStream or Omnikart"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5e35b1]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Live Showcase URL *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. https://paystream.codeflies-showcase.io"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm font-['JetBrains_Mono'] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5e35b1]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Tech Stack Architecture (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Next.js 14, Stripe API, PostgreSQL"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5e35b1]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Hashtags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. #Fintech, #Payments, #Enterprise"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5e35b1]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Sales Pitch Summary / Blurb
            </label>
            <textarea
              rows={3}
              placeholder="One-liner or pitch ready for sales proposals and WhatsApp sharing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5e35b1]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#494453] hover:bg-[#eff4ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#5e35b1] text-white text-xs font-semibold hover:bg-[#461599] transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {saving ? "Saving..." : project ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
