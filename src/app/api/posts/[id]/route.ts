export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { Post } from "@/lib/db/entities/Post";
import { getSession } from "@/lib/auth/session";
import { PostSchema } from "@/lib/validations/post.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const post = await postRepo.findOne({ where: { id } });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.userId) {
      return NextResponse.json(
        { message: "Forbidden: You are not allowed to edit this post" },
        { status: 403 }
      );
    }

    post.content = validatedData.data.content;
    await postRepo.save(post);

    return NextResponse.json(post);
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const postRepo = db.getRepository(Post);

    const post = await postRepo.findOne({ where: { id } });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.userId) {
      return NextResponse.json(
        { message: "Forbidden: You are not allowed to delete this post" },
        { status: 403 }
      );
    }

    await postRepo.remove(post);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}