import { getDb } from "@/lib/db/data-source";
import { AuditLog, AuditAction } from "@/lib/db/entities/AuditLog";
import { NextRequest } from "next/server";

interface LogAuditParams {
  action: AuditAction | string;
  targetType: "POST" | "USER" | "AUTH" | "PROFILE";
  targetId?: string | null;
  userId?: string | null;
  metadata?: Record<string, any>;
  req?: NextRequest | Request;
}

export async function recordAudit(params: LogAuditParams): Promise<void> {
  try {
    const db = await getDb();
    const auditRepo = db.getRepository(AuditLog);

    let ip: string | null = null;
    let userAgent: string | null = null;

    if (params.req) {
      ip =
        params.req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        params.req.headers.get("x-real-ip") ||
        "127.0.0.1";
      userAgent = params.req.headers.get("user-agent") || "unknown";
    }

    const entry = auditRepo.create({
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || null,
      userId: params.userId || null,
      metadata: {
        ...params.metadata,
        ip,
        userAgent,
      },
    });

    await auditRepo.save(entry);
  } catch (error) {
    // جلوگیری از مسدود شدن فرایند اصلی در صورت بروز خطای لاگینگ
    console.error("[AuditLog Error] Failed to write audit record:", error);
  }
}