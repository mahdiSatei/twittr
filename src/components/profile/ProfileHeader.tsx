"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Edit, Lock, UserPlus, UserCheck } from "lucide-react";

interface ProfileUser {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  isPrivate?: boolean;
  isFollowing?: boolean;
  followersCount?: number;
  followingCount?: number;
}

interface ProfileHeaderProps {
  user: ProfileUser;
  isOwner: boolean;
  onFollowToggled?: () => void;
}

export default function ProfileHeader({ user, isOwner, onFollowToggled }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(Boolean(user.isFollowing));
  const [followersCount, setFollowersCount] = useState(user.followersCount || 0);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    const previous = isFollowing;
    setIsFollowing(!previous);
    setFollowersCount(previous ? followersCount - 1 : followersCount + 1);

    try {
      const res = await fetch(`/api/users/${user.username}/follow`, {
        method: previous ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error();
      if (onFollowToggled) onFollowToggled();
    } catch {
      setIsFollowing(previous);
      setFollowersCount(user.followersCount || 0);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Intl.DateTimeFormat("fa-IR", {
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 items-center">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-20 h-20 rounded-full object-cover border" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{user.displayName || user.username}</h1>
              {user.isPrivate && (
                <span title="حساب خصوصی است" className="text-amber-500 bg-amber-50 p-1 rounded-full">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>

        {/* دکمه ویرایش برای مالک، یا دکمه Follow/Unfollow برای بیننده */}
        {isOwner ? (
          <Link
            href="/profile/edit"
            className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>ویرایش پروفایل</span>
          </Link>
        ) : (
          <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-sm font-semibold transition ${
              isFollowing
                ? "border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>دنبال می‌کنید</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>دنبال کردن</span>
              </>
            )}
          </button>
        )}
      </div>

      {user.bio && <p className="mt-4 text-sm text-gray-800 whitespace-pre-wrap">{user.bio}</p>}

      {/* آمار فالوئرها و فالوینگ‌ها */}
      <div className="mt-4 flex items-center gap-4 text-xs">
        <div>
          <span className="font-bold text-gray-900">{user.followingCount || 0}</span>{" "}
          <span className="text-gray-500">دنبال‌شونده</span>
        </div>
        <div>
          <span className="font-bold text-gray-900">{followersCount}</span>{" "}
          <span className="text-gray-500">دنبال‌کننده</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 mr-auto">
          <Calendar className="w-3.5 h-3.5" />
          <span>عضویت از {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}