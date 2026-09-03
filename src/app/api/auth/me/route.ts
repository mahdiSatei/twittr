export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const db = await getDb();
    const userRepo = db.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: session.userId },
      select: ["id", "username", "email", "displayName", "avatarUrl", "bio", "createdAt"],
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}