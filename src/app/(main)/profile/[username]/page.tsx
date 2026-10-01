"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostCard, { PostItem } from "@/components/posts/PostCard";
import { Lock } from "lucide-react";

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, meRes] = await Promise.all([
        fetch(`/api/users/${username}`),
        fetch("/api/auth/me"),
      ]);

      if (!userRes.ok) throw new Error("کاربر یافت نشد");

      const userData = await userRes.json();
      const meData = await meRes.json();

      setProfile(userData);
      setCurrentUserId(meData.user?.id || null);
    } catch (err: any) {
      setError(err.message || "خطا در دریافت پروفایل");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) return <div className="text-center py-12 text-gray-400 text-sm">در حال بارگذاری...</div>;
  if (error || !profile) return <div className="text-center py-12 text-gray-500 text-sm">{error}</div>;

  const isOwner = currentUserId === profile.id;

  return (
    <div>
      <ProfileHeader user={profile} isOwner={isOwner} onFollowToggled={loadProfile} />

      {/* اگر کاربر Private باشد و بیننده اجازه دیدن نداشته باشد */}
      {!profile.canViewPosts ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center my-4 shadow-sm">
          <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">این حساب خصوصی است</h3>
          <p className="text-xs text-gray-500">
            برای مشاهده پست‌های @{profile.username}، باید این کاربر را دنبال کنید.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">پست‌ها</h2>
          {profile.posts?.length === 0 ? (
            <div className="text-center py-8 bg-white border rounded-xl text-gray-400 text-sm">
              پستی برای نمایش وجود ندارد.
            </div>
          ) : (
            profile.posts.map((post: PostItem) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onPostUpdated={loadProfile}
                onPostDeleted={loadProfile}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}