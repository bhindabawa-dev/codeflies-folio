import { getGoogleOAuthUrl } from "@/lib/auth";
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
  const origin = getPublicOrigin(req);
  const url = getGoogleOAuthUrl(origin);

  if (!url) {
    return NextResponse.json(
      {
        error:
          "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.",
      },
      { status: 400 }
    );
  }

  return NextResponse.redirect(url);
}
