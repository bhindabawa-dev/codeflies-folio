import { Project } from "./types";
import * as XLSX from "xlsx";

/**
 * Export projects to an Excel spreadsheet (.xlsx)
 */
export function exportProjectsToExcel(
  projects: Project[],
  filename = "codeflies_portfolio_export.xlsx"
) {
  if (!projects || projects.length === 0) return false;

  const data = projects.map((p, idx) => ({
    "#": idx + 1,
    Title: p.title,
    URL: p.url,
    Category: p.category || "website",
    Description: p.description || "",
    "Tech Stack": Array.isArray(p.techStack) ? p.techStack.join(", ") : "",
    Tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
    "Added Date": p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [
    { wch: 5 }, // #
    { wch: 34 }, // Title
    { wch: 36 }, // URL
    { wch: 18 }, // Category
    { wch: 45 }, // Description
    { wch: 36 }, // Tech Stack
    { wch: 28 }, // Tags
    { wch: 14 }, // Date
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Showcase Projects");
  XLSX.writeFile(wb, filename);
  return true;
}

/**
 * Export projects to standard CSV (.csv)
 */
export function exportProjectsToCSV(
  projects: Project[],
  filename = "codeflies_portfolio_export.csv"
) {
  if (!projects || projects.length === 0) return false;

  const data = projects.map((p, idx) => ({
    "#": idx + 1,
    Title: p.title,
    URL: p.url,
    Category: p.category || "website",
    Description: p.description || "",
    "Tech Stack": Array.isArray(p.techStack) ? p.techStack.join(", ") : "",
    Tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
