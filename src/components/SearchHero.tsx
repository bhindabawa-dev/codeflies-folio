"use client";

import {
  Globe,
  Grid,
  Layers,
  List,
  Maximize2,
  Megaphone,
  Minimize2,
  Search,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface CategoryCount {
  all: number;
  website: number;
  "mobile app": number;
  "digital marketing": number;
}

interface SearchHeroProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: CategoryCount;
  activeFilter: string;
  onFilterSelect: (filter: string) => void;
  availableTags: string[];
  availableTechStacks: string[];
  totalResultsCount: number;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

export function SearchHero({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  activeFilter,
  onFilterSelect,
  availableTags,
  availableTechStacks,
  totalResultsCount,
  viewMode,
  onViewModeChange,
}: SearchHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const compactInputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const compactSearchWrapperRef = useRef<HTMLDivElement>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"compact" | "google">("compact");

  // Load layout mode preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("codeflies_search_layout_mode");
      if (saved === "google" || saved === "compact") {
        setLayoutMode(saved);
      }
    } catch {}
  }, []);

  const changeLayoutMode = (mode: "compact" | "google") => {
    setLayoutMode(mode);
    try {
      localStorage.setItem("codeflies_search_layout_mode", mode);
    } catch {}
  };

  // If user has typed anything in search, ALWAYS be in compact thin bar mode
  const isCompact = layoutMode === "compact" || searchTerm.trim().length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSuggestionsOpen(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isCompact) {
          compactInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      } else if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((document.activeElement as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        if (isCompact) {
          compactInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCompact]);

  // Close suggestions when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(target) &&
        compactSearchWrapperRef.current &&
        !compactSearchWrapperRef.current.contains(target)
      ) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { id: "all", label: "All", icon: Layers, count: categoryCounts.all },
    { id: "website", label: "Website", icon: Globe, count: categoryCounts.website },
    { id: "mobile app", label: "Mobile App", icon: Smartphone, count: categoryCounts["mobile app"] },
    { id: "digital marketing", label: "Digital Marketing", icon: Megaphone, count: categoryCounts["digital marketing"] },
  ];

  // Auto-suggestions based on search query
  const query = searchTerm.toLowerCase().trim();
  const suggestedCategories = [
    { name: "Website", type: "Category", categoryKey: "website" },
    { name: "Mobile App", type: "Category", categoryKey: "mobile app" },
    { name: "Digital Marketing", type: "Category", categoryKey: "digital marketing" },
  ].filter((c) => !query || c.name.toLowerCase().includes(query));

  const suggestedTech = availableTechStacks
    .filter((t) => !query || t.toLowerCase().includes(query))
    .slice(0, 6);

  const suggestedTags = availableTags
    .filter((t) => !query || t.toLowerCase().replace("#", "").includes(query.replace("#", "")))
    .slice(0, 6);

  const hasSuggestions =
    isSuggestionsOpen &&
    (suggestedCategories.length > 0 || suggestedTech.length > 0 || suggestedTags.length > 0);

  // Suggestions Dropdown Popup
  const renderSuggestionsDropdown = () => {
    if (!hasSuggestions) return null;
    return (
      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#cbdbf5] shadow-2xl p-3 z-50 text-left animate-in fade-in-50">
        <div className="text-[10px] font-semibold text-[#7b7484] uppercase tracking-wider px-2 py-0.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#5e35b1]">
            <Sparkles className="w-3 h-3" /> Quick Filter Suggestions
          </span>
          <span className="text-[9px] text-[#7b7484]">Esc to close</span>
        </div>

        {/* Categories */}
        <div className="mt-1 pb-1.5 border-b border-[#eff4ff]">
          <div className="flex flex-wrap gap-1 mt-0.5">
            {suggestedCategories.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  onCategoryChange(c.categoryKey);
                  setIsSuggestionsOpen(false);
                }}
                className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#eff4ff] text-[#461599] hover:bg-[#eaddff] transition-all flex items-center gap-1 border border-[#d1bcff]/40 shadow-2xs"
              >
                <span>{c.name}</span>
                <span className="text-[10px] text-[#5e35b1]/80 font-bold">
                  ({categoryCounts[c.categoryKey as keyof CategoryCount] || 0})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tech Stacks */}
        {suggestedTech.length > 0 && (
          <div className="mt-1.5 pb-1.5 border-b border-[#eff4ff]">
            <div className="text-[10px] text-[#7b7484] px-1 font-medium">Tech Stacks:</div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {suggestedTech.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onSearchChange(t);
                    setIsSuggestionsOpen(false);
                  }}
                  className="px-2 py-0.5 rounded-lg text-xs font-medium bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#5e35b1] border border-[#cbdbf5]/60 transition-colors shadow-2xs"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {suggestedTags.length > 0 && (
          <div className="mt-1.5">
            <div className="text-[10px] text-[#7b7484] px-1 font-medium">Hashtags:</div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {suggestedTags.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onSearchChange(t);
                    setIsSuggestionsOpen(false);
                  }}
                  className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#eaddff]/60 text-[#461599] hover:bg-[#d1bcff] transition-colors shadow-2xs"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ========================================================================= */
  /* COMPACT THIN TOP BAR (Optimizes space: 52px total height, rest is results) */
  /* ========================================================================= */
  if (isCompact) {
    return (
      <div className="sticky top-16 z-30 w-full bg-[#f8f9ff]/95 backdrop-blur-md border-b border-[#e5eeff] py-2 px-3 sm:px-8 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left: Thin Search Input */}
          <div
            ref={compactSearchWrapperRef}
            className="relative w-full md:w-[360px] lg:w-[440px] shrink-0"
          >
            <div className="relative flex items-center bg-white rounded-xl shadow-xs border border-[#5e35b1]/30 focus-within:border-[#5e35b1] focus-within:ring-2 focus-within:ring-[#5e35b1]/20 transition-all">
              <div className="pl-3 flex items-center pointer-events-none text-[#5e35b1]">
                <Search className="w-4 h-4" />
              </div>

              <input
                ref={compactInputRef}
                type="text"
                value={searchTerm}
                onFocus={() => setIsSuggestionsOpen(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                placeholder="Search projects, stack, tags..."
                className="w-full py-1.5 px-2 bg-transparent text-[#0b1c30] placeholder:text-[#7b7484] text-xs sm:text-sm focus:outline-none"
              />

              <div className="pr-2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    onClick={() => {
                      onSearchChange("");
                      compactInputRef.current?.focus();
                    }}
                    className="p-1 text-[#494453] hover:text-[#0b1c30] rounded transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-['JetBrains_Mono'] text-[#7b7484] bg-[#eff4ff] border border-[#cbdbf5] rounded">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Dropdown in compact mode */}
            {renderSuggestionsDropdown()}
          </div>

          {/* Center: Inline Category Chips */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto w-full md:w-auto py-0.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();

              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-[#5e35b1] text-white shadow-2xs"
                      : "bg-white border border-[#cbdbf5] text-[#0b1c30] hover:bg-[#eff4ff]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#5e35b1]"}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#eff4ff] text-[#5e35b1]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Results Count, View Switcher & Expand to Hero */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-semibold text-[#494453]">
              <strong className="text-[#5e35b1]">{totalResultsCount}</strong> projects
            </span>

            {/* View Mode Toggle: Table vs Grid */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#cbdbf5]">
              <button
                onClick={() => onViewModeChange("table")}
                className={`p-1 rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-[#5e35b1] text-white"
                    : "text-[#7b7484] hover:text-[#0b1c30]"
                }`}
                title="Spreadsheet Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-1 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#5e35b1] text-white"
                    : "text-[#7b7484] hover:text-[#0b1c30]"
                }`}
                title="Card Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toggle to Google-Style Centered View */}
            <button
              onClick={() => changeLayoutMode("google")}
              className="p-1.5 rounded-lg border border-[#cbdbf5] bg-white text-[#494453] hover:text-[#5e35b1] hover:bg-[#eff4ff] transition-all text-[11px] font-medium flex items-center gap-1"
              title="Switch to Centered Google-style search"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden xl:inline">Google View</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* GOOGLE-STYLE CENTERED HERO (when search is empty & user toggled it)       */
  /* ========================================================================= */
  return (
    <section className="relative z-30 w-full px-4 sm:px-8 pt-8 pb-4 overflow-visible transition-all">
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* Google-like Clean Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#461599] to-[#5e35b1] flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            C
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Codeflies Portfolio Search
          </h1>
        </div>

        <p className="text-xs text-[#494453] max-w-md">
          Search showcase URLs, tech architectures, or hashtags across all client verticals.
        </p>

        {/* Centered Search Box */}
        <div className="w-full mt-5 relative">
          <div ref={searchWrapperRef} className="relative z-40">
            <div className="relative flex items-center bg-white rounded-2xl shadow-md border border-[#5e35b1]/30 focus-within:border-[#5e35b1] focus-within:ring-2 focus-within:ring-[#5e35b1]/20 transition-all">
              <div className="pl-4 flex items-center pointer-events-none text-[#5e35b1]">
                <Search className="w-5 h-5" />
              </div>

              <input
                ref={inputRef}
                type="text"
                autoFocus
                value={searchTerm}
                onFocus={() => setIsSuggestionsOpen(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                placeholder="Search website, mobile app, tech stack, or hashtags..."
                className="w-full py-3.5 px-3 bg-transparent text-[#0b1c30] placeholder:text-[#7b7484] text-sm sm:text-base font-normal focus:outline-none"
              />

              <div className="pr-3 flex items-center gap-1.5">
                {searchTerm && (
                  <button
                    onClick={() => {
                      onSearchChange("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-[#494453] hover:text-[#0b1c30] rounded-lg transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-['JetBrains_Mono'] text-[#7b7484] bg-[#eff4ff] border border-[#cbdbf5] rounded-md">
                  ⌘K
                </kbd>

                <button
                  onClick={() => {
                    changeLayoutMode("compact");
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#5e35b1] text-white text-xs sm:text-sm font-semibold hover:bg-[#461599] transition-all shadow-sm active:scale-95"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Suggestions dropdown */}
            {renderSuggestionsDropdown()}
          </div>

          {/* Quick Category Chips */}
          <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap relative z-10">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();

              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs ${
                    isSelected
                      ? "bg-[#5e35b1] text-white shadow-sm"
                      : "bg-white border border-[#cbdbf5] text-[#0b1c30] hover:bg-[#f8f9ff]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#5e35b1]"}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#eff4ff] text-[#5e35b1]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Switch to Compact toolbar button */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#7b7484]">
            <button
              onClick={() => changeLayoutMode("compact")}
              className="hover:text-[#5e35b1] hover:underline flex items-center gap-1 transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Switch to high-density compact toolbar ({totalResultsCount} projects)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
