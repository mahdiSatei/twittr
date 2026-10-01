export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { Post } from "@/lib/db/entities/Post";
import { Like } from "@/lib/db/entities/Like";
import { Reply } from "@/lib/db/entities/Reply";
import { Follow } from "@/lib/db/entities/Follow";
import { getSession } from "@/lib/auth/session";
import { PostSchema } from "@/lib/validations/post.schema";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const postRepo = db.getRepository(Post);
    const likeRepo = db.getRepository(Like);
    const replyRepo = db.getRepository(Reply);
    const followRepo = db.getRepository(Follow);

    // افراد فالوشده توسط کاربر جاری
    let followingIds: string[] = [];
    if (session) {
      const follows = await followRepo.find({
        where: { followerId: session.userId },
        select: ["followingId"],
      });
      followingIds = follows.map((f) => f.followingId);
    }

    // کوئری با شرط حریم خصوصی:
    // ۱. پست متعلق به کاربر عمومی باشد (author.isPrivate = false)
    // ۲. یا اگر خصوصی است، کاربر خودش نویسنده باشد یا آن را فالو کرده باشد
    const query = postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    if (session) {
      query.where(
        "author.isPrivate = false OR post.authorId = :currentUserId" +
          (followingIds.length > 0 ? " OR post.authorId IN (:...followingIds)" : ""),
        { currentUserId: session.userId, followingIds }
      );
    } else {
      // کاربران مهمان فقط پست‌های اکانت‌های عمومی را می‌بینند
      query.where("author.isPrivate = false");
    }

    const [posts, total] = await query.getManyAndCount();

    const enrichedPosts = await Promise.all(
      posts.map(async (p) => {
        const [likesCount, userLiked, repliesCount] = await Promise.all([
          likeRepo.count({ where: { postId: p.id } }),
          session ? likeRepo.findOne({ where: { postId: p.id, userId: session.userId } }) : null,
          replyRepo.count({ where: { postId: p.id } }),
        ]);

        return {
          id: p.id,
          content: p.content,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          authorId: p.authorId,
          author: {
            id: p.author.id,
            username: p.author.username,
            displayName: p.author.displayName,
            avatarUrl: p.author.avatarUrl,
            isPrivate: p.author.isPrivate,
          },
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
      return NextResponse.json({ message: validatedData.error.errors[0].message }, { status: 400 });
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
    });

    return NextResponse.json(
      {
        ...savedPost,
        likesCount: 0,
        isLiked: false,
        repliesCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}