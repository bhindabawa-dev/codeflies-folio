import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { getUserByEmail, upsertUser } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, demoRole } = body;

    let targetEmail = email?.trim().toLowerCase();
    let targetName = "";
    let targetRole: "ADMIN" | "USER" = "USER";
    let targetStatus: "ACTIVE" | "REVOKED" | "PENDING" = "ACTIVE";

    if (demoRole === "admin") {
      targetEmail = process.env.ADMIN_DEFAULT_EMAIL?.toLowerCase() || "info@codeflies.com";
      targetName = "Codeflies Admin";
      targetRole = "ADMIN";
      targetStatus = "ACTIVE";
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    let user = await getUserByEmail(targetEmail);
    if (!user) {
      user = await upsertUser({
        email: targetEmail,
        name: targetName || targetEmail.split("@")[0],
        role: targetRole,
        status: targetStatus,
      });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      image: user.image,
    });

    const res = NextResponse.json({
      success: true,
      user,
    });

    setSessionCookie(res, token);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
