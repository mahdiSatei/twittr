"use client";

import { useEffect, useState, useCallback } from "react";
import PostCard, { PostItem } from "@/components/posts/PostCard";
import Link from "next/link";
import { Users } from "lucide-react";

export default function TimelinePage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true);
      const [timelineRes, meRes] = await Promise.all([
        fetch("/api/timeline"),
        fetch("/api/auth/me"),
      ]);

      if (timelineRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      const timelineData = await timelineRes.json();
      const meData = await meRes.json();

      setPosts(timelineData.posts || []);
      setCurrentUserId(meData.user?.id || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">تایم‌لاین شما</h1>
        <span className="text-xs text-gray-400">پست‌های افرادی که دنبال می‌کنید</span>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">در حال بارگذاری تایم‌لاین...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="inline-flex p-3 bg-blue-50 text-blue-500 rounded-full mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">تایم‌لاین شما خالی است!</h3>
          <p className="text-xs text-gray-500 mb-4">
            شما هنوز کاربری را دنبال نکرده‌اید یا کاربرانی که دنبال می‌کنید هنوز پستی نگذاشته‌اند.
          </p>
          <Link
            href="/explore"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-full text-xs font-semibold hover:bg-blue-600 transition"
          >
            کشف کاربران در Explore
          </Link>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onPostUpdated={fetchTimeline}
            onPostDeleted={fetchTimeline}
          />
        ))
      )}
    </div>
  );
}