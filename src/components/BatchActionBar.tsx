"use client";

import { Check, Copy, Download, FileSpreadsheet, Share2, X } from "lucide-react";
import React, { useState } from "react";

export type CopyFormat = "whatsapp" | "markdown" | "email" | "plain";

interface BatchActionBarProps {
  totalCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onCopyAll: (format: CopyFormat) => void;
  onClearSelection: () => void;
  onExportExcel?: () => void;
  onExportCSV?: () => void;
}

export function BatchActionBar({
  totalCount,
  selectedCount,
  isAllSelected,
  onToggleSelectAll,
  onCopyAll,
  onClearSelection,
  onExportExcel,
  onExportCSV,
}: BatchActionBarProps) {
  const [format, setFormat] = useState<CopyFormat>("whatsapp");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyAll(format);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  // If nothing selected, render a minimal low-profile strip that doesn't consume screen space
  if (selectedCount === 0) {
    return (
      <div className="w-full px-4 sm:px-8 py-1.5 flex items-center justify-between text-xs text-[#7b7484]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] hover:text-[#0b1c30] transition-colors">
            <input
              type="checkbox"
              checked={isAllSelected && totalCount > 0}
              onChange={onToggleSelectAll}
              className="w-3.5 h-3.5 rounded text-[#5e35b1] accent-[#5e35b1] cursor-pointer"
            />
            <span>Select all {totalCount} projects</span>
          </label>

          <span className="text-[11px] text-[#7b7484] hidden sm:inline">
            Select items to copy pitches or export spreadsheet
          </span>
        </div>
      </div>
    );
  }

  // Active state when projects are selected
  return (
    <section className="sticky top-28 z-20 w-full px-4 sm:px-8 py-1.5 bg-[#f8f9ff]/95 backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-1">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 py-2 rounded-xl bg-white shadow-md shadow-purple-950/5 border border-[#5e35b1]/30">
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected && totalCount > 0}
              onChange={onToggleSelectAll}
              className="w-4 h-4 rounded text-[#5e35b1] accent-[#5e35b1] cursor-pointer"
            />
            <span className="text-xs font-bold text-[#0b1c30]">Select All</span>
          </label>

          <span className="w-px h-3.5 bg-[#cbc3d5] hidden sm:block"></span>

          <span className="text-xs text-[#494453]">
            <strong className="text-[#5e35b1] font-bold">{selectedCount}</strong>{" "}
            of {totalCount} selected
          </span>

          <button
            onClick={onClearSelection}
            className="text-xs text-[#7b7484] hover:text-red-600 flex items-center gap-0.5 ml-2 transition-colors"
            title="Deselect all"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Format Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#494453]">
            <span className="hidden md:inline font-medium text-[11px]">Format:</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as CopyFormat)}
              className="px-2 py-1 rounded-lg bg-[#eff4ff] border border-[#cbdbf5] text-xs font-medium text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#5e35b1] cursor-pointer"
            >
              <option value="whatsapp">WhatsApp Pitch</option>
              <option value="markdown">Markdown Deck</option>
              <option value="email">Client Email</option>
              <option value="plain">Clean URLs Only</option>
            </select>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-[#5e35b1] text-white hover:bg-[#461599]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy ({selectedCount})</span>
              </>
            )}
          </button>

          {/* Export to Excel (.xlsx) */}
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all shadow-2xs active:scale-95"
              title="Download selected projects as Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline">Excel</span>
            </button>
          )}

          {/* Export to CSV (.csv) */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#cbdbf5] text-[#0b1c30] text-xs font-semibold hover:bg-[#eff4ff] transition-all shadow-2xs active:scale-95"
              title="Download selected projects as CSV (.csv)"
            >
              <Download className="w-3.5 h-3.5 text-[#5e35b1]" />
              <span className="hidden lg:inline">CSV</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
