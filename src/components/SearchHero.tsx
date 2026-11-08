"use client";

import { Globe, Layers, Megaphone, Search, Smartphone, Sparkles, X } from "lucide-react";
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
}: SearchHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((document.activeElement as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close suggestions when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  // Search auto-suggestions based on search query
  const query = searchTerm.toLowerCase().trim();
  const suggestedCategories = [
    { name: "Website", type: "Category", categoryKey: "website" },
    { name: "Mobile App", type: "Category", categoryKey: "mobile app" },
    { name: "Digital Marketing", type: "Category", categoryKey: "digital marketing" },
  ].filter((c) => !query || c.name.toLowerCase().includes(query));

  const suggestedTech = availableTechStacks
    .filter((t) => !query || t.toLowerCase().includes(query))
    .slice(0, 5);

  const suggestedTags = availableTags
    .filter((t) => !query || t.toLowerCase().replace("#", "").includes(query.replace("#", "")))
    .slice(0, 5);

  const hasSuggestions =
    isSuggestionsOpen &&
    (suggestedCategories.length > 0 || suggestedTech.length > 0 || suggestedTags.length > 0);

  return (
    <section className="relative w-full px-4 sm:px-8 pt-8 pb-4 overflow-visible">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0b1c30] tracking-tight">
          Portfolio Search
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#494453] max-w-xl">
          Instantly search, copy, and share verified Codeflies client-ready showcase URLs across Web, Mobile, and Marketing.
        </p>

        {/* Search Input Bar with suggestions */}
        <div ref={containerRef} className="w-full max-w-2xl mt-6 relative z-30">
          <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-purple-950/5 border border-[#5e35b1]/20 focus-within:border-[#5e35b1] focus-within:ring-2 focus-within:ring-[#5e35b1]/20 transition-all">
            <div className="pl-4 flex items-center pointer-events-none text-[#5e35b1]">
              <Search className="w-5 h-5" />
            </div>

            <input
              ref={inputRef}
              type="text"
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

              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-['JetBrains_Mono'] text-[#7b7484] bg-[#eff4ff] border border-[#cbdbf5] rounded-md">
                ⌘K
              </kbd>

              <button
                onClick={() => {
                  setIsSuggestionsOpen(false);
                  inputRef.current?.focus();
                }}
                className="px-4 py-2 rounded-xl bg-[#5e35b1] text-white text-xs sm:text-sm font-semibold hover:bg-[#461599] transition-all shadow-sm active:scale-95"
              >
                Search
              </button>
            </div>
          </div>

          {/* Interactive Search Suggestions Dropdown */}
          {hasSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#cbdbf5] shadow-2xl p-3 z-40 text-left animate-in fade-in-50">
              <div className="text-[11px] font-semibold text-[#7b7484] uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#5e35b1]" /> Search Suggestions
              </div>

              {/* Categories */}
              <div className="mt-1 pb-2 border-b border-[#eff4ff]">
                <div className="text-[10px] text-[#7b7484] px-2 font-medium">Categories:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {suggestedCategories.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        onCategoryChange(c.categoryKey);
                        setIsSuggestionsOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#eff4ff] text-[#461599] hover:bg-[#eaddff] transition-colors flex items-center gap-1"
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-[#5e35b1]/70 font-normal">
                        ({categoryCounts[c.categoryKey as keyof CategoryCount] || 0})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech Stacks */}
              {suggestedTech.length > 0 && (
                <div className="mt-2 pb-2 border-b border-[#eff4ff]">
                  <div className="text-[10px] text-[#7b7484] px-2 font-medium">Tech Stacks:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestedTech.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          onSearchChange(t);
                          setIsSuggestionsOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#eff4ff] border border-[#cbdbf5]/60 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {suggestedTags.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] text-[#7b7484] px-2 font-medium">Hashtags:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestedTags.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          onSearchChange(t);
                          setIsSuggestionsOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eaddff]/60 text-[#461599] hover:bg-[#d1bcff] transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Primary Category Switcher (All, Website, Mobile App, Digital Marketing) */}
          <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();

              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                    isSelected
                      ? "bg-[#5e35b1] text-white shadow-md shadow-purple-950/20 scale-102"
                      : "bg-white border border-[#cbdbf5] text-[#0b1c30] hover:border-[#5e35b1]/60 hover:bg-[#f8f9ff]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#5e35b1]"}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#eff4ff] text-[#5e35b1]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Additional Filter Preset Pills if available */}
          {availableTags.length > 0 && (
            <div className="mt-3.5 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#7b7484] font-medium mr-1">Tags:</span>
              {availableTags.slice(0, 8).map((tag) => {
                const isActive =
                  activeFilter.toLowerCase() === tag.toLowerCase() ||
                  searchTerm.toLowerCase().includes(tag.toLowerCase());

                return (
                  <button
                    key={tag}
                    onClick={() => onFilterSelect(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#eaddff] text-[#24005b] font-semibold border border-[#d1bcff] shadow-sm"
                        : "bg-[#e5eeff] text-[#494453] hover:bg-[#dce9ff] hover:text-[#0b1c30]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
