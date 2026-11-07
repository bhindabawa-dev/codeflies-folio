import { getCurrentSession } from "@/lib/auth";
import { createProject, getProjects } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentSession();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required. Please sign in to view portfolio projects.",
          projects: [],
        },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error: "Your access has been revoked or is pending administrator approval.",
          status: user.status,
          user,
        },
        { status: 403 }
      );
    }

    const { searchParams } = req.nextUrl;
    const query = searchParams.get("q")?.toLowerCase().trim() || "";
    const tagFilter = searchParams.get("tag")?.toLowerCase().trim() || "";

    let projects = await getProjects();

    if (query) {
      projects = projects.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const urlMatch = p.url.toLowerCase().includes(query);
        const descMatch = p.description.toLowerCase().includes(query);
        const techMatch = p.techStack.some((t) => t.toLowerCase().includes(query));
        const tagMatch = p.tags.some((tag) => tag.toLowerCase().includes(query));
        return titleMatch || urlMatch || descMatch || techMatch || tagMatch;
      });
    }

    if (tagFilter) {
      projects = projects.filter((p) =>
        p.tags.some(
          (t) =>
            t.toLowerCase() === tagFilter ||
            t.toLowerCase() === `#${tagFilter}` ||
            t.toLowerCase().replace("#", "") === tagFilter.replace("#", "")
        )
      );
    }

    return NextResponse.json({
      projects,
      total: projects.length,
      user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load projects";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentSession();
    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Unauthorized: Active user account required to add projects." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, url, description, techStack, tags } = body;

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: "Project title and URL are required." },
        { status: 400 }
      );
    }

    const parsedTech = Array.isArray(techStack)
      ? techStack.map((t) => String(t).trim()).filter(Boolean)
      : typeof techStack === "string"
      ? techStack.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const parsedTags = Array.isArray(tags)
      ? tags.map((t) => (String(t).trim().startsWith("#") ? String(t).trim() : `#${String(t).trim()}`)).filter(Boolean)
      : typeof tags === "string"
      ? tags.split(",").map((t) => (t.trim().startsWith("#") ? t.trim() : `#${t.trim()}`)).filter(Boolean)
      : [];

    const newProject = await createProject({
      title,
      url,
      description: description || `${title}: Live showcase at ${url}`,
      techStack: parsedTech,
      tags: parsedTags,
    });

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
