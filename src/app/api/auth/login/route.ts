export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";
import { LoginSchema } from "@/lib/validations/auth.schema";
import { comparePassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { buildAuthCookie } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit/logger";
import { AuditAction } from "@/lib/db/entities/AuditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = LoginSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ message: validatedData.error.errors[0].message }, { status: 400 });
    }

    const { identifier, password } = validatedData.data;
    const db = await getDb();
    const userRepo = db.getRepository(User);

    const user = await userRepo.findOne({
      where: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // ثبت لاگ ورود
    await recordAudit({
      action: AuditAction.USER_LOGIN,
      targetType: "AUTH",
      targetId: user.id,
      userId: user.id,
      metadata: { username: user.username },
      req,
    });

    const token = await signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role || "USER",
    });

    const response = NextResponse.json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });

    response.cookies.set(buildAuthCookie(token));
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}