import { createSessionToken, exchangeGoogleCode, setSessionCookie } from "@/lib/auth";
import { getUserByEmail, upsertUser } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

function getPublicOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return req.nextUrl.origin;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const origin = getPublicOrigin(req);
  const redirectUri = `${origin}/api/auth/callback/google`;

  if (error || !code) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(error || "Authorization cancelled")}`
    );
  }

  try {
    const profile = await exchangeGoogleCode(code, redirectUri);
    const googleEmail = profile.email.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "info@codeflies.com").toLowerCase().trim();
    const isGoogleAdmin = googleEmail === adminEmail;

    let user = await getUserByEmail(googleEmail);

    if (!user) {
      user = await upsertUser({
        email: googleEmail,
        name: profile.name,
        image: profile.image,
        role: isGoogleAdmin ? "ADMIN" : "USER",
        status: "ACTIVE",
      });
    } else if (isGoogleAdmin && user.role !== "ADMIN") {
      user = await upsertUser({
        email: googleEmail,
        name: profile.name || user.name,
        image: profile.image || user.image,
        role: "ADMIN",
        status: "ACTIVE",
      });
    }

    if (user.status === "REVOKED") {
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent("Your account access has been revoked by an administrator.")}`
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

    const response = NextResponse.redirect(`${origin}/`);
    setSessionCookie(response, token);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(message)}`);
  }
}
