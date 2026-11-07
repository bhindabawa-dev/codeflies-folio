import { createSessionToken, exchangeGoogleCode, setSessionCookie } from "@/lib/auth";
import { getUserByEmail, upsertUser } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback/google`;

  if (error || !code) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(error || "Authorization cancelled")}`
    );
  }

  try {
    const profile = await exchangeGoogleCode(code, redirectUri);
    let user = await getUserByEmail(profile.email);

    if (!user) {
      user = await upsertUser({
        email: profile.email,
        name: profile.name,
        image: profile.image,
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

    const response = NextResponse.redirect(`${origin}/`);
    setSessionCookie(response, token);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(message)}`);
  }
}
