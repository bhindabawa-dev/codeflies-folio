import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { getUserByEmail, upsertUser } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const targetEmail = email?.trim().toLowerCase();

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "info@codeflies.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";

    // Check if user already exists
    let user = await getUserByEmail(targetEmail);

    const isAdminTarget = targetEmail === adminEmail;
    const isExistingAdmin = user?.role === "ADMIN";

    // Strictly enforce admin password verification for any administrator account
    if (isAdminTarget || isExistingAdmin) {
      if (!password || password.trim() !== adminPassword.trim()) {
        return NextResponse.json(
          { error: "Invalid administrator password. Access denied." },
          { status: 401 }
        );
      }
    }

    if (isAdminTarget) {
      if (!user) {
        user = await upsertUser({
          email: targetEmail,
          name: "Codeflies Admin",
          role: "ADMIN",
          status: "ACTIVE",
        });
      } else if (user.role !== "ADMIN") {
        user = await upsertUser({
          email: targetEmail,
          name: user.name || "Codeflies Admin",
          role: "ADMIN",
          status: "ACTIVE",
        });
      }
    } else {
      // Normal team member login
      if (!user) {
        user = await upsertUser({
          email: targetEmail,
          name: targetEmail.split("@")[0],
          role: "USER",
          status: "ACTIVE",
        });
      }
    }

    // Check if account has been revoked by admin
    if (user.status === "REVOKED") {
      return NextResponse.json(
        { error: "Your account access has been revoked by an administrator." },
        { status: 403 }
      );
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
