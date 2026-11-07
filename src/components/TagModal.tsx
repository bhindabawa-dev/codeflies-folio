"use client";

import { Project } from "@/lib/types";
import { Tag, X } from "lucide-react";
import React, { useState } from "react";

interface TagModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTag: (projectId: string, tag: string) => Promise<void>;
}

export function TagModal({ project, isOpen, onClose, onSaveTag }: TagModalProps) {
  const [tagName, setTagName] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tagName.trim();
    if (!trimmed) return;

    const formatted = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

    try {
      setSaving(true);
      await onSaveTag(project.id, formatted);
      setTagName("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#e5eeff]">
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#5e35b1]" />
            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30]">
              Attach Pitch Tag
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#494453] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-[#494453]">
            Adding tag to <strong className="text-[#0b1c30]">{project.title}</strong>
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              New Hashtag Name
            </label>
            <input
              type="text"
              autoFocus
              required
              placeholder="#HighConverting or #SeriesB"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5e35b1]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#494453] hover:bg-[#eff4ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-[#5e35b1] text-white text-xs font-semibold hover:bg-[#461599] transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
