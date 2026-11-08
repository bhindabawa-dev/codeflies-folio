import { getCurrentSession } from "@/lib/auth";
import { deleteProject, updateProject } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentSession();
    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Unauthorized: Active user account required to edit projects." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const { title, url, description, techStack, tags, category, order } = body;

    const parsedTech =
      techStack !== undefined
        ? Array.isArray(techStack)
          ? techStack.map((t) => String(t).trim()).filter(Boolean)
          : typeof techStack === "string"
          ? techStack.split(",").map((t) => t.trim()).filter(Boolean)
          : []
        : undefined;

    const parsedTags =
      tags !== undefined
        ? Array.isArray(tags)
          ? tags.map((t) =>
              String(t).trim().startsWith("#") ? String(t).trim() : `#${String(t).trim()}`
            ).filter(Boolean)
          : typeof tags === "string"
          ? tags.split(",").map((t) => (t.trim().startsWith("#") ? t.trim() : `#${t.trim()}`)).filter(Boolean)
          : []
        : undefined;

    const parsedCategory =
      category !== undefined
        ? ["website", "mobile app", "digital marketing"].includes(
            String(category).toLowerCase().trim()
          )
          ? String(category).toLowerCase().trim()
          : "website"
        : undefined;

    const updated = await updateProject(id, {
      ...(title !== undefined && { title }),
      ...(url !== undefined && { url }),
      ...(description !== undefined && { description }),
      ...(parsedTech !== undefined && { techStack: parsedTech }),
      ...(parsedTags !== undefined && { tags: parsedTags }),
      ...(parsedCategory !== undefined && { category: parsedCategory }),
      ...(order !== undefined && { order: Number(order) }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentSession();
    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required to delete projects." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = await deleteProject(id);

    if (!deleted) {
      return NextResponse.json({ error: "Project not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
