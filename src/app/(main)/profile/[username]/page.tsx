"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostCard, { PostItem } from "@/components/posts/PostCard";

interface ProfileData {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  posts: PostItem[];
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
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

      if (!userRes.ok) {
        throw new Error("User not found");
      }

      const userData = await userRes.json();
      const meData = await meRes.json();

      setProfile(userData);
      setCurrentUserId(meData.user?.id || null);
    } catch (err: any) {
      setError(err.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return <div className="text-center py-10 text-gray-400 text-sm">Loading profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="text-center py-10 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm">
        {error || "User does not exist."}
      </div>
    );
  }

  const isOwner = currentUserId === profile.id;

  return (
    <div>
      <ProfileHeader user={profile} isOwner={isOwner} />

      <h2 className="text-base font-bold text-gray-900 mb-3">Posts</h2>

      {profile.posts.length === 0 ? (
        <div className="text-center py-8 bg-white border border-gray-200 rounded-xl text-gray-400 text-sm">
          @{profile.username} has not posted yet.
        </div>
      ) : (
        <div>
          {profile.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onPostUpdated={loadProfile}
              onPostDeleted={loadProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}