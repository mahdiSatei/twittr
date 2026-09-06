export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/data-source";
import { AuditLog } from "@/lib/db/entities/AuditLog";
import { User, UserRole } from "@/lib/db/entities/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const userRepo = db.getRepository(User);
    const currentUser = await userRepo.findOne({ where: { id: session.userId } });

    // اعتبارسنجی سطح دسترسی ادمین
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const actionFilter = searchParams.get("action");
    const skip = (page - 1) * limit;

    const auditRepo = db.getRepository(AuditLog);
    const query = auditRepo
      .createQueryBuilder("log")
      .leftJoinAndSelect("log.user", "user")
      .orderBy("log.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    if (actionFilter && actionFilter !== "ALL") {
      query.andWhere("log.action = :action", { action: actionFilter });
    }

    const [logs, total] = await query.getManyAndCount();

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        createdAt: log.createdAt,
        metadata: log.metadata,
        user: log.user
          ? {
              id: log.user.id,
              username: log.user.username,
              displayName: log.user.displayName,
              role: log.user.role,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}