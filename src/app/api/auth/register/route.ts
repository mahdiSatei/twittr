export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { User, UserRole } from "@/lib/db/entities/User";
import { RegisterSchema } from "@/lib/validations/auth.schema";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { buildAuthCookie } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit/logger";
import { AuditAction } from "@/lib/db/entities/AuditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = RegisterSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ message: validatedData.error.errors[0].message }, { status: 400 });
    }

    const { username, email, password, displayName } = validatedData.data;
    const db = await getDb();
    const userRepo = db.getRepository(User);

    const existingUser = await userRepo.findOne({ where: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ message: "Username or Email is already taken" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = userRepo.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName || username,
      role: UserRole.USER,
    });

    await userRepo.save(newUser);

    // ثبت لاگ ثبت‌نام
    await recordAudit({
      action: AuditAction.USER_REGISTER,
      targetType: "USER",
      targetId: newUser.id,
      userId: newUser.id,
      metadata: { username: newUser.username, email: newUser.email },
      req,
    });

    const token = await signToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          displayName: newUser.displayName,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set(buildAuthCookie(token));
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}