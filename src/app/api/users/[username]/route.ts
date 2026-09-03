export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    // در Next.js 15 و 16 حتماً params باید await شود
    const resolvedParams = await params;
    const username = resolvedParams.username;

    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    const db = await getDb();
    const userRepo = db.getRepository(User);

    const user = await userRepo.findOne({
      where: { username: username.toLowerCase() },
      relations: ["posts", "posts.author"],
      order: {
        posts: { createdAt: "DESC" },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        posts: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          author: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}