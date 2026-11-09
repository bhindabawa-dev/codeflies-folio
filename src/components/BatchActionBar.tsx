"use client";

import { Check, Copy, Share2 } from "lucide-react";
import React, { useState } from "react";

export type CopyFormat = "whatsapp" | "markdown" | "email" | "plain";

interface BatchActionBarProps {
  totalCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onCopyAll: (format: CopyFormat) => void;
  onClearSelection: () => void;
}

export function BatchActionBar({
  totalCount,
  selectedCount,
  isAllSelected,
  onToggleSelectAll,
  onCopyAll,
  onClearSelection,
}: BatchActionBarProps) {
  const [format, setFormat] = useState<CopyFormat>("whatsapp");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyAll(format);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section className="sticky top-16 z-20 w-full px-4 sm:px-8 py-2.5 bg-[#f8f9ff]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white shadow-sm border border-[#e5eeff]">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected && totalCount > 0}
              onChange={onToggleSelectAll}
              className="w-4 h-4 rounded text-[#5e35b1] accent-[#5e35b1] cursor-pointer"
            />
            <span className="text-sm font-semibold text-[#0b1c30]">Select All</span>
          </label>

          <span className="w-px h-4 bg-[#cbc3d5] hidden sm:block"></span>

          <span className="text-xs sm:text-sm text-[#494453]">
            <strong className="text-[#5e35b1] font-semibold">{selectedCount}</strong>{" "}
            of {totalCount} projects selected
          </span>

          {selectedCount > 0 && (
            <button
              onClick={onClearSelection}
              className="text-xs text-[#7b7484] hover:text-[#0b1c30] underline ml-2 sm:hidden"
            >
              Deselect
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-[#494453]">
            <span className="hidden md:inline font-medium">Format:</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as CopyFormat)}
              className="px-2.5 py-1.5 rounded-lg bg-[#eff4ff] border border-[#cbdbf5] text-xs font-medium text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#5e35b1] cursor-pointer"
            >
              <option value="whatsapp">WhatsApp Pitch</option>
              <option value="markdown">Markdown Deck</option>
              <option value="email">Client Email</option>
              <option value="plain">Clean URLs Only</option>
            </select>
          </div>

          <button
            onClick={handleCopy}
            disabled={selectedCount === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
              selectedCount === 0
                ? "bg-[#cbdbf5] text-[#7b7484] cursor-not-allowed"
                : copied
                ? "bg-emerald-600 text-white"
                : "bg-[#5e35b1] text-white hover:bg-[#461599]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Selected ({selectedCount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
