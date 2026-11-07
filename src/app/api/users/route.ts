import { getCurrentSession } from "@/lib/auth";
import { getUsers, updateUserAccess } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentSession();
    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required to manage users." },
        { status: 403 }
      );
    }

    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getCurrentSession();
    if (!sessionUser || sessionUser.role !== "ADMIN" || sessionUser.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    if (userId === sessionUser.id && status === "REVOKED") {
      return NextResponse.json(
        { error: "You cannot revoke your own administrator account." },
        { status: 400 }
      );
    }

    const updated = await updateUserAccess(userId, {
      ...(role && { role }),
      ...(status && { status }),
    });

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user access";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
