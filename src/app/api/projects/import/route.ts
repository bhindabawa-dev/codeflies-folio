import { getCurrentSession } from "@/lib/auth";
import { bulkCreateProjects } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentSession();

    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required to import data." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const rawProjects = body?.projects;

    if (!Array.isArray(rawProjects) || rawProjects.length === 0) {
      return NextResponse.json(
        { error: "No projects provided for import. Expected an array of project items." },
        { status: 400 }
      );
    }

    const validProjects: Array<{
      title: string;
      url: string;
      description?: string;
      techStack: string[];
      tags: string[];
      category?: string;
    }> = [];

    const validCategories = ["website", "mobile app", "digital marketing"];

    for (const item of rawProjects) {
      const rawTitle = String(item.title || item["Project Title"] || item["Name"] || "").trim();
      let rawUrl = String(
        item.url || item["URL"] || item["Link"] || item["Website"] || item["Project URL"] || ""
      ).trim();

      if (!rawTitle || !rawUrl) {
        continue; // Skip rows missing title or URL
      }

      // Auto-prefix protocol if missing
      if (!/^https?:\/\//i.test(rawUrl)) {
        rawUrl = `https://${rawUrl}`;
      }

      // Category parsing
      const rawCat = String(item.category || item["Category"] || item["Type"] || "")
        .toLowerCase()
        .trim();
      let parsedCat = "website";
      if (rawCat.includes("app") || rawCat.includes("mobile") || rawCat.includes("ios") || rawCat.includes("android")) {
        parsedCat = "mobile app";
      } else if (rawCat.includes("market") || rawCat.includes("seo") || rawCat.includes("digital") || rawCat.includes("campaign") || rawCat.includes("ppc")) {
        parsedCat = "digital marketing";
      } else if (validCategories.includes(rawCat)) {
        parsedCat = rawCat;
      }

      // Tech Stack parsing
      const rawTech = item.techStack || item["Tech Stack"] || item["Technologies"] || item["Stack"] || [];
      let parsedTech: string[] = [];
      if (Array.isArray(rawTech)) {
        parsedTech = rawTech.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof rawTech === "string") {
        parsedTech = rawTech
          .split(/[,;\n]/)
          .map((t) => t.trim())
          .filter(Boolean);
      }

      // Tags parsing
      const rawTags = item.tags || item["Tags"] || item["Hashtags"] || item["Keywords"] || [];
      let parsedTags: string[] = [];
      if (Array.isArray(rawTags)) {
        parsedTags = rawTags
          .map((t) => {
            const trimmed = String(t).trim();
            return trimmed ? (trimmed.startsWith("#") ? trimmed : `#${trimmed}`) : "";
          })
          .filter(Boolean);
      } else if (typeof rawTags === "string") {
        parsedTags = rawTags
          .split(/[,;\s]/)
          .map((t) => {
            const trimmed = t.trim();
            return trimmed ? (trimmed.startsWith("#") ? trimmed : `#${trimmed}`) : "";
          })
          .filter(Boolean);
      }

      // Description
      const rawDesc = String(
        item.description || item["Description"] || item["Summary"] || item["Pitch"] || ""
      ).trim();

      validProjects.push({
        title: rawTitle,
        url: rawUrl,
        category: parsedCat,
        description: rawDesc || `${rawTitle}: Live showcase at ${rawUrl}`,
        techStack: parsedTech,
        tags: parsedTags,
      });
    }

    if (validProjects.length === 0) {
      return NextResponse.json(
        { error: "No valid project rows found. Make sure each row includes at least a Title and a URL." },
        { status: 400 }
      );
    }

    const result = await bulkCreateProjects(validProjects);

    return NextResponse.json({
      success: true,
      count: result.count,
      projects: result.projects,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to import projects";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
