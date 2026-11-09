"use client";

import { Project, ProjectCategory } from "@/lib/types";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";

interface AdminImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (title: string, subtitle?: string, type?: "success" | "info" | "warning") => void;
}

interface ParsedRow {
  title: string;
  url: string;
  category: ProjectCategory | string;
  description: string;
  techStack: string[];
  tags: string[];
  isValid: boolean;
  error?: string;
}

export function AdminImportModal({
  isOpen,
  onClose,
  onSuccess,
  onToast,
}: AdminImportModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "guide">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Generate and download sample Excel spreadsheet (.xlsx)
  const downloadExcelTemplate = () => {
    try {
      const templateData = [
        {
          Title: "Codeflies Enterprise Cloud Portal",
          URL: "https://cloud.codeflies.com",
          Category: "website",
          Description: "Next-generation cloud infrastructure management portal with real-time telemetry.",
          "Tech Stack": "Next.js, TypeScript, Tailwind CSS, PostgreSQL, AWS",
          Tags: "#cloud, #saas, #enterprise, #nextjs",
        },
        {
          Title: "Pulse Health Patient App",
          URL: "https://pulsehealth.example.com",
          Category: "mobile app",
          Description: "Cross-platform telemedicine and encrypted EHR patient records mobile app.",
          "Tech Stack": "React Native, Node.js, GraphQL, PostgreSQL, WebRTC",
          Tags: "#healthcare, #mobile, #ios, #android, #webrtc",
        },
        {
          Title: "Global Retail Omni-Commerce",
          URL: "https://globalretail.example.com",
          Category: "website",
          Description: "Multi-currency headless e-commerce store with high-conversion checkout.",
          "Tech Stack": "Shopify Hydrogen, React, Tailwind CSS, Stripe",
          Tags: "#ecommerce, #shopify, #headless, #stripe",
        },
        {
          Title: "Fintech Growth & PPC Campaign",
          URL: "https://fintechgrowth.example.com",
          Category: "digital marketing",
          Description: "B2B performance marketing and search engine conversion optimization campaign.",
          "Tech Stack": "Google Ads, Meta Pixel, Looker Studio, HubSpot",
          Tags: "#growth, #marketing, #seo, #ppc",
        },
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);
      ws["!cols"] = [
        { wch: 35 }, // Title
        { wch: 36 }, // URL
        { wch: 18 }, // Category
        { wch: 50 }, // Description
        { wch: 45 }, // Tech Stack
        { wch: 38 }, // Tags
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Projects");
      XLSX.writeFile(wb, "codeflies_portfolio_template.xlsx");

      onToast("Template Downloaded", "Sample Excel file (.xlsx) downloaded successfully.", "success");
    } catch (err) {
      onToast("Download Failed", "Could not generate Excel template file.", "warning");
    }
  };

  // Generate and download sample CSV (.csv)
  const downloadCsvTemplate = () => {
    try {
      const csvContent = `Title,URL,Category,Description,Tech Stack,Tags
Codeflies Enterprise Cloud Portal,https://cloud.codeflies.com,website,"Next-generation cloud infrastructure management portal with real-time telemetry.","Next.js, TypeScript, Tailwind CSS, PostgreSQL, AWS","#cloud, #saas, #enterprise, #nextjs"
Pulse Health Patient App,https://pulsehealth.example.com,mobile app,"Cross-platform telemedicine and encrypted EHR patient records mobile app.","React Native, Node.js, GraphQL, PostgreSQL, WebRTC","#healthcare, #mobile, #ios, #android, #webrtc"
Global Retail Omni-Commerce,https://globalretail.example.com,website,"Multi-currency headless e-commerce store with high-conversion checkout.","Shopify Hydrogen, React, Tailwind CSS, Stripe","#ecommerce, #shopify, #headless, #stripe"
Fintech Growth & PPC Campaign,https://fintechgrowth.example.com,digital marketing,"B2B performance marketing and search engine conversion optimization campaign.","Google Ads, Meta Pixel, Looker Studio, HubSpot","#growth, #marketing, #seo, #ppc"`;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "codeflies_portfolio_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onToast("Template Downloaded", "Sample CSV file downloaded successfully.", "success");
    } catch {
      onToast("Download Failed", "Could not generate CSV template file.", "warning");
    }
  };

  // Parse uploaded spreadsheet file
  const handleFileProcess = async (selectedFile: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setFile(selectedFile);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("The uploaded spreadsheet contains no sheets.");
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
        raw: false,
      });

      if (!rawJson || rawJson.length === 0) {
        throw new Error("The uploaded spreadsheet appears to be empty.");
      }

      const parsed: ParsedRow[] = [];

      for (const row of rawJson) {
        // Find fields with flexible case-insensitive matching
        const findField = (...aliases: string[]): string => {
          for (const alias of aliases) {
            const lowerAlias = alias.toLowerCase();
            for (const key of Object.keys(row)) {
              if (key.trim().toLowerCase() === lowerAlias) {
                return String(row[key] || "").trim();
              }
            }
          }
          return "";
        };

        const title = findField("title", "project title", "name", "project name");
        let url = findField("url", "project url", "link", "website", "live url");
        const rawCategory = findField("category", "type", "project type").toLowerCase();
        const description = findField("description", "summary", "pitch", "details", "notes");
        const rawTech = findField("tech stack", "techstack", "technologies", "tech", "skills", "stack");
        const rawTags = findField("tags", "tag", "hashtags", "hashtag", "keywords");

        // Validate title and url
        if (!title && !url) {
          // Empty blank row, skip quietly
          continue;
        }

        let isValid = true;
        let error = "";

        if (!title) {
          isValid = false;
          error = "Missing Project Title";
        } else if (!url) {
          isValid = false;
          error = "Missing Project URL";
        }

        if (url && !/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }

        // Category mapping
        let category: ProjectCategory = "website";
        if (
          rawCategory.includes("mobile") ||
          rawCategory.includes("app") ||
          rawCategory.includes("ios") ||
          rawCategory.includes("android")
        ) {
          category = "mobile app";
        } else if (
          rawCategory.includes("market") ||
          rawCategory.includes("seo") ||
          rawCategory.includes("digital") ||
          rawCategory.includes("campaign")
        ) {
          category = "digital marketing";
        }

        // Tech stack parsing
        const techStack = rawTech
          ? rawTech
              .split(/[,;\n]/)
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        // Tags parsing
        const tags = rawTags
          ? rawTags
              .split(/[,;\s]/)
              .map((t) => {
                const cleaned = t.trim();
                return cleaned ? (cleaned.startsWith("#") ? cleaned : `#${cleaned}`) : "";
              })
              .filter(Boolean)
          : [];

        parsed.push({
          title,
          url,
          category,
          description: description || `${title}: Live showcase at ${url}`,
          techStack,
          tags,
          isValid,
          error,
        });
      }

      if (parsed.length === 0) {
        throw new Error(
          "Could not identify any valid project columns. Please check that your Excel file includes 'Title' and 'URL' headers."
        );
      }

      setParsedRows(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error parsing spreadsheet file.";
      setErrorMessage(msg);
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleConfirmImport = async () => {
    if (validRows.length === 0) {
      setErrorMessage("No valid projects available to import.");
      return;
    }

    try {
      setIsImporting(true);
      setErrorMessage(null);

      const payload = validRows.map((r) => ({
        title: r.title,
        url: r.url,
        category: r.category,
        description: r.description,
        techStack: r.techStack,
        tags: r.tags,
      }));

      const res = await fetch("/api/projects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: payload }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        try {
          const rawExisting = localStorage.getItem("codeflies_portfolio_projects_backup");
          const existing = rawExisting ? JSON.parse(rawExisting) : [];
          const merged = [...(data.projects || []), ...existing];
          localStorage.setItem("codeflies_portfolio_projects_backup", JSON.stringify(merged));
        } catch {}

        onToast(
          "Import Successful",
          `Successfully imported ${data.count} projects into the portfolio showcase.`,
          "success"
        );
        onSuccess();
        onClose();
      } else {
        const errorText = data.error || "Failed to import projects.";
        setErrorMessage(errorText);
        onToast("Import Error", errorText, "warning");
      }
    } catch {
      const netError = "Network error while saving imported projects.";
      setErrorMessage(netError);
      onToast("Error", netError, "warning");
    } finally {
      setIsImporting(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#e5eeff] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eff4ff] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30]">
                  Import Projects from Excel
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Admin Feature
                </span>
              </div>
              <p className="text-xs text-[#494453]">
                Upload .xlsx, .xls, or .csv spreadsheets to bulk add portfolio links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#494453] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#eff4ff] px-6 bg-[#f8f9ff]">
          <button
            onClick={() => setActiveTab("upload")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "upload"
                ? "border-[#5e35b1] text-[#5e35b1]"
                : "border-transparent text-[#7b7484] hover:text-[#0b1c30]"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload & Import</span>
            {parsedRows.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {validRows.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "guide"
                ? "border-[#5e35b1] text-[#5e35b1]"
                : "border-transparent text-[#7b7484] hover:text-[#0b1c30]"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Format Guide & Templates</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1">
                <span className="font-semibold">Import Warning: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {activeTab === "upload" ? (
            <div>
              {!file ? (
                /* Drag & Drop Upload Zone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#5e35b1] bg-[#5e35b1]/5"
                      : "border-[#cbdbf5] hover:border-[#5e35b1] hover:bg-[#f8f9ff]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eaddff] text-[#461599] flex items-center justify-center mb-4 shadow-xs">
                    <UploadCloud className="w-7 h-7" />
                  </div>

                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30]">
                    Drop your Excel or CSV file here
                  </h3>
                  <p className="text-xs text-[#494453] mt-1 max-w-sm mx-auto">
                    Supports Microsoft Excel (<code className="text-[#5e35b1]">.xlsx</code>,{" "}
                    <code className="text-[#5e35b1]">.xls</code>) or standard comma-separated (
                    <code className="text-[#5e35b1]">.csv</code>)
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-[#5e35b1] text-white text-xs font-semibold hover:bg-[#461599] transition-all shadow-xs"
                    >
                      Browse Files
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab("guide");
                      }}
                      className="px-3 py-2 rounded-xl border border-[#cbdbf5] text-[#0b1c30] text-xs font-semibold hover:bg-white transition-all"
                    >
                      View Suggested Format
                    </button>
                  </div>
                </div>
              ) : (
                /* File Processing / Preview Zone */
                <div className="space-y-4">
                  {/* File info banner */}
                  <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#cbdbf5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#0b1c30] truncate max-w-xs sm:max-w-md">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-[#494453] flex items-center gap-2 mt-0.5">
                          <span>{(file.size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">
                            {validRows.length} valid projects found
                          </span>
                          {invalidRows.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 font-semibold">
                                {invalidRows.length} incomplete rows skipped
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={resetUpload}
                        disabled={isImporting}
                        className="px-3 py-1.5 rounded-lg border border-[#cbdbf5] text-[#494453] hover:text-[#0b1c30] text-xs font-medium hover:bg-white transition-all disabled:opacity-50"
                      >
                        Change File
                      </button>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-[#e5eeff] rounded-xl overflow-hidden shadow-xs">
                    <div className="px-4 py-2.5 bg-[#f8f9ff] border-b border-[#eff4ff] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0b1c30]">
                        Data Preview ({parsedRows.length} rows detected)
                      </span>
                      <span className="text-[11px] text-[#7b7484]">
                        Showing valid projects ready for database insertion
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#eff4ff] text-[#494453] text-[11px] uppercase tracking-wider font-semibold sticky top-0 z-10 border-b border-[#cbdbf5]/50">
                          <tr>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Title</th>
                            <th className="px-3 py-2">Category</th>
                            <th className="px-3 py-2">URL</th>
                            <th className="px-3 py-2">Tech Stack</th>
                            <th className="px-3 py-2">Tags</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eff4ff]">
                          {parsedRows.map((row, idx) => (
                            <tr
                              key={idx}
                              className={`hover:bg-[#f8f9ff] transition-colors ${
                                !row.isValid ? "bg-amber-50/40 text-[#7b7484]" : ""
                              }`}
                            >
                              <td className="px-3 py-2 whitespace-nowrap">
                                {row.isValid ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> Ready
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title={row.error}>
                                    <AlertCircle className="w-3 h-3" /> Skipped
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 font-semibold text-[#0b1c30] max-w-[140px] truncate">
                                {row.title || <span className="text-amber-600 italic">Empty Title</span>}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eff4ff] text-[#5e35b1] border border-[#cbdbf5]">
                                  {row.category}
                                </span>
                              </td>
                              <td className="px-3 py-2 max-w-[150px] truncate text-blue-600">
                                {row.url || <span className="text-amber-600 italic">Empty URL</span>}
                              </td>
                              <td className="px-3 py-2 max-w-[140px] truncate text-[#494453]">
                                {row.techStack.length > 0
                                  ? row.techStack.join(", ")
                                  : "—"}
                              </td>
                              <td className="px-3 py-2 max-w-[120px] truncate text-[#7b7484]">
                                {row.tags.length > 0 ? row.tags.join(" ") : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("guide")}
                      className="text-xs text-[#5e35b1] hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Need template format reference?
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={resetUpload}
                        disabled={isImporting}
                        className="px-4 py-2 rounded-xl border border-[#cbdbf5] text-xs font-semibold text-[#494453] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={isImporting || validRows.length === 0}
                        className="px-5 py-2 rounded-xl bg-[#5e35b1] text-white text-xs font-semibold hover:bg-[#461599] transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 active:scale-98"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Importing Projects...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Import ({validRows.length} Projects)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Format Guide & Download Templates */
            <div className="space-y-5">
              {/* Template Download Hero */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#eff4ff] to-[#eaddff]/30 border border-[#cbdbf5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0b1c30] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5e35b1]" />
                    Ready-to-Use Spreadsheet Templates
                  </h4>
                  <p className="text-xs text-[#494453] mt-1 max-w-md">
                    Download pre-formatted templates with sample projects and exact column headers.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={downloadExcelTemplate}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-all shadow-xs active:scale-95"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Download Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={downloadCsvTemplate}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#cbdbf5] text-[#0b1c30] text-xs font-semibold hover:bg-[#eff4ff] transition-all shadow-xs active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-[#5e35b1]" />
                    <span>Download CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Column Specification Table */}
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-2">
                  Suggested Excel Columns Specification
                </h4>

                <div className="border border-[#e5eeff] rounded-xl overflow-hidden shadow-xs text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#eff4ff] text-[#494453] text-[11px] uppercase font-bold border-b border-[#cbdbf5]/50">
                      <tr>
                        <th className="px-3 py-2.5">Column Name</th>
                        <th className="px-3 py-2.5">Requirement</th>
                        <th className="px-3 py-2.5">Accepted Values & Format</th>
                        <th className="px-3 py-2.5">Sample Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eff4ff]">
                      <tr>
                        <td className="px-3 py-2.5 font-bold text-[#0b1c30]">
                          Title <span className="text-[#5e35b1]">*</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Required
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#494453]">
                          Project brand or showcase name
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-[#0b1c30]">
                          Codeflies Cloud Portal
                        </td>
                      </tr>

                      <tr>
                        <td className="px-3 py-2.5 font-bold text-[#0b1c30]">
                          URL <span className="text-[#5e35b1]">*</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Required
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#494453]">
                          Live URL or demo link (auto-prefixes <code className="text-[#5e35b1]">https://</code> if omitted)
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-blue-600">
                          https://cloud.codeflies.com
                        </td>
                      </tr>

                      <tr>
                        <td className="px-3 py-2.5 font-bold text-[#0b1c30]">
                          Category
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Recommended
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#494453]">
                          <code className="text-[#5e35b1]">website</code>,{" "}
                          <code className="text-[#5e35b1]">mobile app</code>, or{" "}
                          <code className="text-[#5e35b1]">digital marketing</code> (defaults to <code className="text-[#5e35b1]">website</code>)
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-[#0b1c30]">
                          website
                        </td>
                      </tr>

                      <tr>
                        <td className="px-3 py-2.5 font-bold text-[#0b1c30]">
                          Description
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                            Optional
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#494453]">
                          Client pitch, architecture summary, or delivery highlights
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-[#494453]">
                          High-throughput cloud monitoring dashboard for DevOps.
                        </td>
                      </tr>

                      <tr>
                        <td className="px-3 py-2.5 font-bold text-[#0b1c30]">
                          Tech Stack
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                            Optional
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#494453]">
                          Comma-separated list of technologies used
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-[#494453]">
                          Next.js, TypeScript, AWS
                        </td>
                      </tr>

                      <tr>
                        <td className="px-3 py-2.5 font-bold text-[#0b1c30]">
                          Tags
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                            Optional
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#494453]">
                          Comma or space-separated hashtags (auto-adds <code className="text-[#5e35b1]">#</code> if missing)
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-[#7b7484]">
                          #cloud, #devops, #saas
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Helper Notes */}
              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-xs space-y-1.5 text-[#494453]">
                <div className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#5e35b1]" />
                  Intelligent Importer Features:
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                  <li>Column headers are case-insensitive (<code className="text-[#5e35b1]">Title</code>, <code className="text-[#5e35b1]">title</code>, or <code className="text-[#5e35b1]">Project Title</code> are all recognized).</li>
                  <li>Any rows without a Title or URL are safely skipped without halting the import.</li>
                  <li>URLs without <code className="text-[#5e35b1]">https://</code> are automatically corrected.</li>
                  <li>Tags automatically receive a <code className="text-[#5e35b1]">#</code> symbol if entered without one.</li>
                </ul>
              </div>

              {/* Back to upload CTA */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className="px-5 py-2.5 rounded-xl bg-[#5e35b1] text-white text-xs font-semibold hover:bg-[#461599] transition-all flex items-center gap-2 shadow-xs"
                >
                  <span>Go to File Upload</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
