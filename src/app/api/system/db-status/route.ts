import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;
  const hasDbUrl = Boolean(dbUrl);
  const isLocalhost = Boolean(dbUrl?.includes("localhost"));
  const isNeon = Boolean(dbUrl?.includes("neon.tech"));
  const maskedUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ":***@") : "NOT_SET";

  let connectionStatus = "untested";
  let errorMessage: string | null = null;
  let projectCount = 0;

  try {
    if (dbUrl && !isLocalhost) {
      await prisma.$queryRaw`SELECT 1`;
      projectCount = await prisma.project.count();
      connectionStatus = "connected";
    } else if (isLocalhost) {
      connectionStatus = "localhost_not_available_on_vercel";
    } else {
      connectionStatus = "missing_database_url";
    }
  } catch (err: unknown) {
    connectionStatus = "failed";
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    hasDbUrl,
    isLocalhost,
    isNeon,
    maskedUrl,
    connectionStatus,
    errorMessage,
    projectCount,
  });
}
