export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { Post } from "@/lib/db/entities/Post";
import { Follow } from "@/lib/db/entities/Follow";
import { Like } from "@/lib/db/entities/Like";
import { Reply } from "@/lib/db/entities/Reply";
import { getSession } from "@/lib/auth/session";
import { In } from "typeorm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const followRepo = db.getRepository(Follow);
    const postRepo = db.getRepository(Post);
    const likeRepo = db.getRepository(Like);
    const replyRepo = db.getRepository(Reply);

    // ۱. استخراج کسانی که کاربر فالو کرده است
    const following = await followRepo.find({
      where: { followerId: session.userId },
      select: ["followingId"],
    });

    const followingIds = following.map((f) => f.followingId);

    // اگر کسی را فالو نکرده، فید خالی برمی‌گردد
    if (followingIds.length === 0) {
      return NextResponse.json({ posts: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    // ۲. دریافت پست‌های افراد فالوشده به ترتیب جدیدترین
    const [posts, total] = await postRepo.findAndCount({
      where: { authorId: In(followingIds) },
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
          isPrivate: true,
        },
      },
    });

    // ۳. اضافه کردن آمار لایک‌ها و ریپلای‌ها برای هر پست
    const enrichedPosts = await Promise.all(
      posts.map(async (p) => {
        const [likesCount, userLiked, repliesCount] = await Promise.all([
          likeRepo.count({ where: { postId: p.id } }),
          likeRepo.findOne({ where: { postId: p.id, userId: session.userId } }),
          replyRepo.count({ where: { postId: p.id } }),
        ]);

        return {
          ...p,
          likesCount,
          isLiked: Boolean(userLiked),
          repliesCount,
        };
      })
    );

    return NextResponse.json({
      posts: enrichedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Timeline error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}