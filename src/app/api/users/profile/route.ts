export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const db = await getDb();
    const userRepo = db.getRepository(User);
    const user = await userRepo.findOne({ where: { id: session.userId } });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { displayName, bio, avatarUrl, isPrivate } = body;

    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (typeof isPrivate === "boolean") user.isPrivate = isPrivate; // ذخیره وضعیت پرایوت

    await userRepo.save(user);

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isPrivate: user.isPrivate,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}