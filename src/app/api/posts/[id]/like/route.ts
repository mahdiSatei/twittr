export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { Post } from "@/lib/db/entities/Post";
import { Like } from "@/lib/db/entities/Like";
import { getSession } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const postRepo = db.getRepository(Post);
    const post = await postRepo.findOne({ where: { id } });
    if (!post) return NextResponse.json({ message: "Post not found" }, { status: 404 });

    const likeRepo = db.getRepository(Like);
    const existing = await likeRepo.findOne({ where: { postId: id, userId: session.userId } });

    if (existing) {
      return NextResponse.json({ message: "Already liked" }, { status: 200 });
    }

    const like = likeRepo.create({ postId: id, userId: session.userId });
    await likeRepo.save(like);

    return NextResponse.json({ message: "Post liked successfully" }, { status: 201 });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const likeRepo = db.getRepository(Like);
    const like = await likeRepo.findOne({ where: { postId: id, userId: session.userId } });

    if (!like) {
      return NextResponse.json({ message: "Post is not liked" }, { status: 404 });
    }

    await likeRepo.remove(like);
    return NextResponse.json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Unlike error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
