export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";
import { Follow } from "@/lib/db/entities/Follow";
import { Like } from "@/lib/db/entities/Like";
import { Reply } from "@/lib/db/entities/Reply";
import { getSession } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;
    const session = await getSession();

    const db = await getDb();
    const userRepo = db.getRepository(User);
    const followRepo = db.getRepository(Follow);
    const likeRepo = db.getRepository(Like);
    const replyRepo = db.getRepository(Reply);

    const user = await userRepo.findOne({
      where: { username: username.toLowerCase() },
      relations: ["posts", "posts.author"],
      order: {
        posts: { createdAt: "DESC" },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isOwner = session?.userId === user.id;

    // بررسی وضعیت فالو
    let isFollowing = false;
    if (session && !isOwner) {
      const follow = await followRepo.findOne({
        where: { followerId: session.userId, followingId: user.id },
      });
      isFollowing = Boolean(follow);
    }

    // آمار فالوئرها و فالوینگ‌ها
    const [followersCount, followingCount] = await Promise.all([
      followRepo.count({ where: { followingId: user.id } }),
      followRepo.count({ where: { followerId: user.id } }),
    ]);

    // آیا کاربر مجاز به دیدن پست‌هاست؟
    // ۱. اگر اکانت عمومی باشد: بله
    // ۲. اگر خودش باشد: بله
    // ۳. اگر اکانت خصوصی باشد اما او را فالو کرده باشد: بله
    const canViewPosts = !user.isPrivate || isOwner || isFollowing;

    let enrichedPosts: any[] = [];
    if (canViewPosts) {
      enrichedPosts = await Promise.all(
        user.posts.map(async (p) => {
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
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
            },
            likesCount,
            isLiked: Boolean(userLiked),
            repliesCount,
          };
        })
      );
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
      isPrivate: user.isPrivate,
      isFollowing,
      canViewPosts,
      followersCount,
      followingCount,
      posts: enrichedPosts,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}