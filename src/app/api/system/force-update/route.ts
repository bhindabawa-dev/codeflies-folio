import { getCurrentSession } from "@/lib/auth";
import { triggerForceUpdate } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentSession();
    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Unauthorized: Only administrators can push a force update." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { version, message } = body;

    const state = await triggerForceUpdate({
      version,
      message,
    });

    return NextResponse.json({
      success: true,
      ...state,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to force update";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
