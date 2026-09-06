export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";
import { ProfileUpdateSchema } from "@/lib/validations/profile.schema";
import { recordAudit } from "@/lib/audit/logger";
import { AuditAction } from "@/lib/db/entities/AuditLog";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = ProfileUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ message: validatedData.error.errors[0].message }, { status: 400 });
    }

    const db = await getDb();
    const userRepo = db.getRepository(User);
    const user = await userRepo.findOne({ where: { id: session.userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { displayName, bio, avatarUrl } = validatedData.data;
    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await userRepo.save(user);

    // ثبت لاگ ویرایش پروفایل
    await recordAudit({
      action: AuditAction.PROFILE_UPDATE,
      targetType: "PROFILE",
      targetId: user.id,
      userId: user.id,
      metadata: {
        updatedFields: {
          hasDisplayName: displayName !== undefined,
          hasBio: bio !== undefined,
          hasAvatar: avatarUrl !== undefined,
        },
      },
      req,
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}