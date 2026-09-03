"use client";

import { useEffect, useState, useCallback } from "react";
import PostComposer from "@/components/posts/PostComposer";
import PostCard, { PostItem } from "@/components/posts/PostCard";

export default function ExplorePage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; avatarUrl?: string | null } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setCurrentUser(data.user);
    } catch {
      setCurrentUser(null);
    }
  };

  const fetchPosts = useCallback(async (targetPage = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts?page=${targetPage}&limit=20`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(targetPage);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts(1);
  }, [fetchPosts]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Explore</h1>

      {currentUser && (
        <PostComposer
          onPostCreated={() => fetchPosts(1)}
          currentUserAvatar={currentUser.avatarUrl}
        />
      )}

      {loading && posts.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 bg-white border border-gray-200 rounded-xl text-gray-500 text-sm">
          No posts yet. Be the first to share something!
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onPostUpdated={() => fetchPosts(page)}
              onPostDeleted={() => fetchPosts(page)}
            />
          ))}

          {/* Simple Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                disabled={page <= 1}
                onClick={() => fetchPosts(page - 1)}
                className="px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchPosts(page + 1)}
                className="px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}