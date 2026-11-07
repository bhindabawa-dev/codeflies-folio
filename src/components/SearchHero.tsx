"use client";

import { Search, X } from "lucide-react";
import React, { useRef, useEffect } from "react";

interface SearchHeroProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterSelect: (filter: string) => void;
  availableTags: string[];
}

export function SearchHero({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterSelect,
  availableTags,
}: SearchHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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

  const defaultPresets = ["Fintech", "E-commerce", "SaaS", "Mobile", "Healthcare", "WebGL"];

  const displayPresets = Array.from(
    new Set([...defaultPresets, ...availableTags.map((t) => t.replace("#", ""))])
  ).slice(0, 7);

  return (
    <section className="relative w-full px-4 sm:px-8 pt-8 pb-4 overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0b1c30] tracking-tight">
          Portfolio Search
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#494453] max-w-xl">
          Instantly search, copy, and share verified Codeflies client-ready showcase URLs.
        </p>

        <div className="w-full max-w-2xl mt-6">
          <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-purple-950/5 border border-[#5e35b1]/20 focus-within:border-[#5e35b1] focus-within:ring-2 focus-within:ring-[#5e35b1]/20 transition-all">
            <div className="pl-4 flex items-center pointer-events-none text-[#5e35b1]">
              <Search className="w-5 h-5" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search projects, tech stack (Next.js, WebRTC), or hashtags..."
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
                onClick={() => inputRef.current?.focus()}
                className="px-4 py-2 rounded-xl bg-[#5e35b1] text-white text-xs sm:text-sm font-semibold hover:bg-[#461599] transition-all shadow-sm active:scale-95"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
            {displayPresets.map((tag) => {
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
        </div>
      </div>
    </section>
  );
}
