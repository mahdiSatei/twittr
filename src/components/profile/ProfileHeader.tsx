import Link from "next/link";
import { Calendar, Edit } from "lucide-react";

interface ProfileUser {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
}

interface ProfileHeaderProps {
  user: ProfileUser;
  isOwner: boolean;
}

export default function ProfileHeader({ user, isOwner }: ProfileHeaderProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 items-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {user.displayName || user.username}
            </h1>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>

        {isOwner && (
          <Link
            href="/profile/edit"
            className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        )}
        {/* TODO: Phase 2 - Follow/Unfollow Button for non-owners */}
      </div>

      {user.bio && <p className="mt-4 text-sm text-gray-800 whitespace-pre-wrap">{user.bio}</p>}

      <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
        <Calendar className="w-3.5 h-3.5" />
        <span>Joined {formattedDate}</span>
      </div>

      {/* TODO: Phase 2 - Following and Followers counts */}
    </div>
  );
}