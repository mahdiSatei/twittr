export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { buildLogoutCookie, getSession } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit/logger";
import { AuditAction } from "@/lib/db/entities/AuditLog";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (session) {
      await recordAudit({
        action: AuditAction.USER_LOGOUT,
        targetType: "AUTH",
        targetId: session.userId,
        userId: session.userId,
        metadata: { username: session.username },
        req,
      });
    }

    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.set(buildLogoutCookie());
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}