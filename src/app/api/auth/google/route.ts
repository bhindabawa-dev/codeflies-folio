import { getGoogleOAuthUrl } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
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
