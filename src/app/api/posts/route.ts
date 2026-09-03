export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { Post } from "@/lib/db/entities/Post";
import { getSession } from "@/lib/auth/session";
import { PostSchema } from "@/lib/validations/post.schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const postRepo = db.getRepository(Post);

    const [posts, total] = await postRepo.findAndCount({
      relations: ["author"],
      order: { createdAt: "DESC" },
      take: limit,
      skip,
      select: {
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
    });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = PostSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: validatedData.error.errors[0].message },
        { status: 400 }
      );
    }

    const db = await getDb();
    const postRepo = db.getRepository(Post);

    const post = postRepo.create({
      content: validatedData.data.content,
      authorId: session.userId,
    });

    await postRepo.save(post);

    const savedPost = await postRepo.findOne({
      where: { id: post.id },
      relations: ["author"],
      select: {
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
    });

    // TODO: Phase 2 - Emit real-time notification / update feed via WebSocket
    return NextResponse.json(savedPost, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}