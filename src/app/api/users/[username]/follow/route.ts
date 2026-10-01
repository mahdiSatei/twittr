export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";
import { Follow } from "@/lib/db/entities/Follow";
import { getSession } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const userRepo = db.getRepository(User);
    const targetUser = await userRepo.findOne({ where: { username: username.toLowerCase() } });

    if (!targetUser) return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (targetUser.id === session.userId) {
      return NextResponse.json({ message: "You cannot follow yourself" }, { status: 400 });
    }

    const followRepo = db.getRepository(Follow);
    const existing = await followRepo.findOne({
      where: { followerId: session.userId, followingId: targetUser.id },
    });

    if (existing) {
      return NextResponse.json({ message: `Already following @${username}` }, { status: 200 });
    }

    const follow = followRepo.create({ followerId: session.userId, followingId: targetUser.id });
    await followRepo.save(follow);

    return NextResponse.json({ message: `Successfully followed @${username}` }, { status: 201 });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const userRepo = db.getRepository(User);
    const targetUser = await userRepo.findOne({ where: { username: username.toLowerCase() } });

    if (!targetUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const followRepo = db.getRepository(Follow);
    const follow = await followRepo.findOne({
      where: { followerId: session.userId, followingId: targetUser.id },
    });

    if (!follow) {
      return NextResponse.json({ message: `Not following @${username}` }, { status: 404 });
    }

    await followRepo.remove(follow);
    return NextResponse.json({ message: `Successfully unfollowed @${username}` });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
