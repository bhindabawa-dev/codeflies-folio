"use client";

import { Project, ProjectCategory } from "@/lib/types";
import { Check, Globe, Megaphone, Plus, Smartphone, Sparkles, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const STANDARD_TECH_STACKS = [
  "Next.js",
  "React",
  "React Native",
  "Flutter",
  "Node.js",
  "TypeScript",
  "Tailwind CSS",
  "PostgreSQL",
  "MongoDB",
  "Python",
  "FastAPI",
  "Shopify Plus",
  "WordPress",
  "Three.js",
  "WebGL",
  "WebRTC",
  "Stripe API",
  "Firebase",
  "GraphQL",
  "AWS",
  "Docker",
  "Vue.js",
  "Angular",
  "ClickHouse",
  "Mapbox GL",
];

const STANDARD_HASHTAGS = [
  "#Website",
  "#MobileApp",
  "#DigitalMarketing",
  "#Fintech",
  "#ECommerce",
  "#Healthcare",
  "#SaaS",
  "#AI",
  "#Logistics",
  "#EdTech",
  "#RealEstate",
  "#Fitness",
  "#SEO",
  "#PPC",
  "#Performance",
  "#Branding",
  "#Enterprise",
  "#B2B",
  "#Marketplace",
];

interface ProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  existingTechStacks?: string[];
  existingTags?: string[];
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    url: string;
    description: string;
    techStack: string[];
    tags: string[];
    category: ProjectCategory | string;
  }) => Promise<void>;
}

export function ProjectModal({
  isOpen,
  project,
  existingTechStacks = [],
  existingTags = [],
  onClose,
  onSave,
}: ProjectModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("website");

  // Tech stack chips & input
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);

  // Hashtags chips & input
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const techRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  // Combine known tags & tech stacks from portfolio with standard defaults
  const allKnownTech = Array.from(
    new Set([...existingTechStacks, ...STANDARD_TECH_STACKS])
  ).filter(Boolean);

  const allKnownTags = Array.from(
    new Set([...existingTags, ...STANDARD_HASHTAGS])
  ).filter(Boolean);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setUrl(project.url);
      setDescription(project.description || "");
      setCategory((project.category as ProjectCategory) || "website");
      setTechStack(project.techStack || []);
      setTags(project.tags || []);
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
      setCategory("website");
      setTechStack([]);
      setTags([]);
    }
    setTechInput("");
    setTagInput("");
    setError("");
  }, [project, isOpen]);

  // Click outside to close suggestion dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (techRef.current && !techRef.current.contains(e.target as Node)) {
        setIsTechDropdownOpen(false);
      }
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Add Tech Stack
  const handleAddTech = (item: string) => {
    const cleaned = item.trim();
    if (!cleaned) return;
    if (!techStack.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setTechStack([...techStack, cleaned]);
    }
    setTechInput("");
    setIsTechDropdownOpen(false);
  };

  const handleRemoveTech = (index: number) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  // Add Hashtag
  const handleAddTag = (item: string) => {
    let cleaned = item.trim();
    if (!cleaned) return;
    if (!cleaned.startsWith("#")) cleaned = `#${cleaned}`;
    if (!tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setTags([...tags, cleaned]);
    }
    setTagInput("");
    setIsTagDropdownOpen(false);
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Filtered auto-suggestions
  const filteredTechSuggestions = allKnownTech
    .filter((t) => !techStack.some((item) => item.toLowerCase() === t.toLowerCase()))
    .filter((t) => !techInput.trim() || t.toLowerCase().includes(techInput.toLowerCase().trim()))
    .slice(0, 8);

  const filteredTagSuggestions = allKnownTags
    .filter((t) => !tags.some((item) => item.toLowerCase() === t.toLowerCase()))
    .filter((t) => {
      const q = tagInput.toLowerCase().replace("#", "").trim();
      return !q || t.toLowerCase().replace("#", "").includes(q);
    })
    .slice(0, 8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setError("Project title and live URL are required.");
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        id: project?.id,
        title: title.trim(),
        url: finalUrl,
        description: description.trim() || `${title.trim()}: Live showcase at ${finalUrl}`,
        techStack,
        tags,
        category,
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
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#e5eeff] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eff4ff] flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
              {project ? "Edit Portfolio Project" : "Add New Portfolio Project"}
            </h2>
            <p className="text-xs text-[#494453]">
              Categorize, link, and tag enterprise portfolio showcase
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#494453] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Category Selector (website, mobile app, digital marketing) */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setCategory("website")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  category === "website"
                    ? "border-[#5e35b1] bg-[#eff4ff] ring-2 ring-[#5e35b1]/20 shadow-xs"
                    : "border-[#cbdbf5] hover:border-[#5e35b1]/60 hover:bg-[#f8f9ff]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  {category === "website" && (
                    <Check className="w-4 h-4 text-[#5e35b1]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0b1c30]">Website</div>
                  <div className="text-[10px] text-[#494453]">Webapps & Portals</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory("mobile app")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  category === "mobile app"
                    ? "border-[#5e35b1] bg-[#eff4ff] ring-2 ring-[#5e35b1]/20 shadow-xs"
                    : "border-[#cbdbf5] hover:border-[#5e35b1]/60 hover:bg-[#f8f9ff]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#461599] flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  {category === "mobile app" && (
                    <Check className="w-4 h-4 text-[#5e35b1]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0b1c30]">Mobile App</div>
                  <div className="text-[10px] text-[#494453]">iOS, Android, Hybrid</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory("digital marketing")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  category === "digital marketing"
                    ? "border-[#5e35b1] bg-[#eff4ff] ring-2 ring-[#5e35b1]/20 shadow-xs"
                    : "border-[#cbdbf5] hover:border-[#5e35b1]/60 hover:bg-[#f8f9ff]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  {category === "digital marketing" && (
                    <Check className="w-4 h-4 text-[#5e35b1]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0b1c30]">Digital Marketing</div>
                  <div className="text-[10px] text-[#494453]">SEO, PPC, Growth</div>
                </div>
              </button>
            </div>
          </div>

          {/* Title & Live URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Project Name / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Omnikart or HealthPulse"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5e35b1]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Live URL *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. https://clientproject.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm font-['JetBrains_Mono'] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5e35b1]"
              />
            </div>
          </div>

          {/* Tech Stack Architecture with Auto-Suggest */}
          <div ref={techRef} className="relative">
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Tech Stack Architecture (with auto-suggestions)
            </label>

            {/* Chips Box */}
            <div className="p-2 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] focus-within:ring-2 focus-within:ring-[#5e35b1] focus-within:bg-white transition-all flex flex-wrap gap-1.5 items-center">
              {techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#cbdbf5] text-xs font-medium text-[#0b1c30] shadow-2xs"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(idx)}
                    className="text-[#7b7484] hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={techInput}
                onChange={(e) => {
                  setTechInput(e.target.value);
                  setIsTechDropdownOpen(true);
                }}
                onFocus={() => setIsTechDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    if (techInput.trim()) {
                      handleAddTech(techInput);
                    }
                  } else if (e.key === "Backspace" && !techInput && techStack.length > 0) {
                    handleRemoveTech(techStack.length - 1);
                  }
                }}
                placeholder={techStack.length === 0 ? "Type tech stack (e.g. Next.js, Flutter) & hit Enter..." : "Add more..."}
                className="flex-1 min-w-[140px] bg-transparent text-xs sm:text-sm text-[#0b1c30] focus:outline-none py-1 px-1 placeholder:text-[#7b7484]"
              />
            </div>

            {/* Auto-suggest Dropdown */}
            {isTechDropdownOpen && filteredTechSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl border border-[#cbdbf5] shadow-xl py-1.5 max-h-48 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#7b7484] flex items-center justify-between">
                  <span>Suggested Tech Stacks:</span>
                  <span className="text-[10px]">Click to add</span>
                </div>
                {filteredTechSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddTech(suggestion)}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#5e35b1] flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium">{suggestion}</span>
                    <Plus className="w-3.5 h-3.5 text-[#5e35b1]" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Pills Suggestion Row */}
            {filteredTechSuggestions.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-[#7b7484] flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#5e35b1]" /> Suggestions:
                </span>
                {filteredTechSuggestions.slice(0, 5).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddTech(t)}
                    className="px-2 py-0.5 rounded-md bg-[#e5eeff] text-[#461599] text-[10px] font-medium hover:bg-[#d1bcff] transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hashtags with Auto-Suggest */}
          <div ref={tagRef} className="relative">
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Hashtags / Pitch Tags (with auto-suggestions)
            </label>

            {/* Chips Box */}
            <div className="p-2 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] focus-within:ring-2 focus-within:ring-[#5e35b1] focus-within:bg-white transition-all flex flex-wrap gap-1.5 items-center">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eaddff]/70 text-xs font-semibold text-[#461599] border border-[#d1bcff]"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-[#461599]/70 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setIsTagDropdownOpen(true);
                }}
                onFocus={() => setIsTagDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    if (tagInput.trim()) {
                      handleAddTag(tagInput);
                    }
                  } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
                    handleRemoveTag(tags.length - 1);
                  }
                }}
                placeholder={tags.length === 0 ? "Type tag (e.g. #Fintech, #Mobile) & hit Enter..." : "Add hashtag..."}
                className="flex-1 min-w-[140px] bg-transparent text-xs sm:text-sm text-[#0b1c30] focus:outline-none py-1 px-1 placeholder:text-[#7b7484]"
              />
            </div>

            {/* Auto-suggest Dropdown */}
            {isTagDropdownOpen && filteredTagSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl border border-[#cbdbf5] shadow-xl py-1.5 max-h-48 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#7b7484] flex items-center justify-between">
                  <span>Suggested Hashtags:</span>
                  <span className="text-[10px]">Click to add</span>
                </div>
                {filteredTagSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddTag(suggestion)}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#5e35b1] flex items-center justify-between transition-colors"
                  >
                    <span className="font-semibold text-[#461599]">{suggestion}</span>
                    <Plus className="w-3.5 h-3.5 text-[#5e35b1]" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Pills Suggestion Row */}
            {filteredTagSuggestions.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-[#7b7484] flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#5e35b1]" /> Suggestions:
                </span>
                {filteredTagSuggestions.slice(0, 5).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddTag(t)}
                    className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#461599] text-[10px] font-semibold border border-[#cbdbf5] hover:bg-[#eaddff] transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description / Pitch Blurb */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Sales Pitch Summary / Pitch Blurb
            </label>
            <textarea
              rows={2}
              placeholder="One-liner or pitch ready for sales proposals, email intros, and WhatsApp sharing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5e35b1]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#eff4ff]">
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
              className="px-5 py-2 rounded-xl bg-[#5e35b1] text-white text-xs font-semibold hover:bg-[#461599] transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <span>Saving...</span>
              ) : project ? (
                <span>Save Changes</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
