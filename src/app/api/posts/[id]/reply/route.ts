export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { Post } from "@/lib/db/entities/Post";
import { Reply } from "@/lib/db/entities/Reply";
import { getSession } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDb();
    const replyRepo = db.getRepository(Reply);

    const replies = await replyRepo.find({
      where: { postId: id },
      relations: ["author"],
      order: { createdAt: "ASC" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    });

    return NextResponse.json({ replies });
  } catch (error) {
    console.error("Get replies error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const content = (body.content || "").trim();

    if (!content || content.length > 280) {
      return NextResponse.json({ message: "Reply must be between 1 and 280 characters" }, { status: 400 });
    }

    const db = await getDb();
    const postRepo = db.getRepository(Post);
    const post = await postRepo.findOne({ where: { id } });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const replyRepo = db.getRepository(Reply);
    const reply = replyRepo.create({
      content,
      postId: post.id,
      authorId: session.userId,
    });

    await replyRepo.save(reply);

    const savedReply = await replyRepo.findOne({
      where: { id: reply.id },
      relations: ["author"],
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    });

    return NextResponse.json(savedReply, { status: 201 });
  } catch (error) {
    console.error("Post reply error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
