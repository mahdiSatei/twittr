"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Check, X } from "lucide-react";

export interface PostItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
}

interface PostCardProps {
  post: PostItem;
  currentUserId?: string | null;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

export default function PostCard({
  post,
  currentUserId,
  onPostUpdated,
  onPostDeleted,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isAuthor = currentUserId === post.authorId;
  const isEdited = new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 1000;

  const handleEditSave = async () => {
    if (!editedContent.trim() || editedContent.length > 280) return;
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update post");
      }

      setIsEditing(false);
      if (onPostUpdated) onPostUpdated();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete post");
      }
      if (onPostDeleted) onPostDeleted();
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(post.createdAt));

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-4 mb-3 transition hover:bg-gray-50/50">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${post.author.username}`} className="flex-shrink-0">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-bold text-gray-900 hover:underline truncate text-sm"
              >
                {post.author.displayName || post.author.username}
              </Link>
              <span className="text-gray-500 text-xs truncate">@{post.author.username}</span>
              <span className="text-gray-400 text-xs">·</span>
              <span className="text-gray-400 text-xs flex-shrink-0">{formattedDate}</span>
              {isEdited && <span className="text-gray-400 text-xs italic">(edited)</span>}
            </div>

            {isAuthor && !isEditing && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-blue-500 rounded"
                  title="Edit Post"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                  title="Delete Post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                maxLength={280}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-500"
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{280 - editedContent.length} left</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(post.content);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={isSubmitting || !editedContent.trim()}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-gray-800 text-sm whitespace-pre-wrap break-words">
              {post.content}
            </p>
          )}

          {/* TODO: Phase 2 - Add Like, Retweet, Comment buttons */}
        </div>
      </div>
    </article>
  );
}