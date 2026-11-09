import { getForceUpdateState } from "@/lib/store";
import { APP_VERSION } from "@/lib/version";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const state = await getForceUpdateState();
    return NextResponse.json(
      {
        appVersion: APP_VERSION,
        currentVersion: state.currentVersion,
        forceTimestamp: state.forceTimestamp,
        message: state.message,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message, appVersion: APP_VERSION }, { status: 500 });
  }
}
