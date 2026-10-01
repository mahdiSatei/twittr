"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Heart, MessageCircle, Send, X, Check } from "lucide-react";

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
    isPrivate?: boolean;
  };
  likesCount?: number;
  isLiked?: boolean;
  repliesCount?: number;
}

interface PostCardProps {
  post: PostItem;
  currentUserId?: string | null;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

export default function PostCard({ post, currentUserId, onPostUpdated, onPostDeleted }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(Boolean(post.isLiked));
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const isAuthor = currentUserId === post.authorId;

  // عملیات لایک و آنلایک
  const handleLikeToggle = async () => {
    if (!currentUserId) {
      alert("برای لایک کردن پست ابتدا وارد حساب خود شوید.");
      return;
    }

    const previousLiked = isLiked;
    const previousLikes = likes;

    setIsLiked(!previousLiked);
    setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: previousLiked ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error();
    } catch {
      setIsLiked(previousLiked);
      setLikes(previousLikes);
    }
  };

  // باز کردن و دریافت ریپلای‌ها
  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      setLoadingReplies(true);
      try {
        const res = await fetch(`/api/posts/${post.id}/reply`);
        const data = await res.json();
        setReplies(data.replies || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  // ارسال ریپلای جدید
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || submittingReply) return;
    if (!currentUserId) {
      alert("برای پاسخ دادن باید وارد حساب خود شوید.");
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      const newReply = await res.json();
      if (!res.ok) throw new Error(newReply.message);

      setReplies([...replies, newReply]);
      setReplyText("");
    } catch (err: any) {
      alert(err.message || "Failed to reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  // ویرایش پست
  const handleEditSave = async () => {
    if (!editedContent.trim() || editedContent.length > 280) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) {
        setIsEditing(false);
        if (onPostUpdated) onPostUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // حذف پست
  const handleDelete = async () => {
    if (!confirm("آیا از حذف این پست اطمینان دارید؟")) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok && onPostDeleted) onPostDeleted();
    } catch (err) {
      console.error(err);
    }
  };

  const formattedDate = new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(post.createdAt));

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-4 mb-3 transition hover:shadow-sm">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${post.author.username}`} className="flex-shrink-0">
          {post.author.avatarUrl ? (
            <img src={post.author.avatarUrl} alt={post.author.username} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Link href={`/profile/${post.author.username}`} className="font-bold text-gray-900 hover:underline truncate text-sm">
                {post.author.displayName || post.author.username}
              </Link>
              <span className="text-gray-500 text-xs truncate">@{post.author.username}</span>
              <span className="text-gray-400 text-xs">·</span>
              <span className="text-gray-400 text-xs">{formattedDate}</span>
            </div>

            {isAuthor && !isEditing && (
              <div className="flex items-center gap-1">
                <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-blue-500 rounded">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleDelete} className="p-1 text-gray-400 hover:text-red-500 rounded">
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
                className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsEditing(false)} className="px-2.5 py-1 text-xs border rounded-full">
                  <X className="w-3 h-3" />
                </button>
                <button onClick={handleEditSave} className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full">
                  <Check className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-gray-800 text-sm whitespace-pre-wrap break-words">{post.content}</p>
          )}

          {/* نوار اکشن‌های اجتماعی: Like و Reply */}
          <div className="flex items-center gap-6 mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
            {/* دکمه لایک */}
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1.5 transition ${isLiked ? "text-red-500 font-semibold" : "hover:text-red-500"}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              <span>{likes}</span>
            </button>

            {/* دکمه ریپلای */}
            <button
              onClick={handleToggleReplies}
              className="flex items-center gap-1.5 hover:text-blue-500 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.repliesCount || replies.length} پاسخ</span>
            </button>
          </div>

          {/* بخش پاسخ‌ها و ارسال ریپلای */}
          {showReplies && (
            <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50/50 p-3 rounded-lg">
              {/* فرم ارسال پاسخ */}
              <form onSubmit={handleSendReply} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="پاسخ خود را بنویسید..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  maxLength={280}
                  className="flex-grow px-3 py-1.5 text-xs border border-gray-300 rounded-full outline-none focus:border-blue-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || submittingReply}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-full text-xs font-medium hover:bg-blue-600 disabled:opacity-40 transition"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>

              {/* لیست پاسخ‌ها */}
              {loadingReplies ? (
                <div className="text-center py-2 text-xs text-gray-400">در حال بارگذاری...</div>
              ) : replies.length === 0 ? (
                <div className="text-center py-2 text-xs text-gray-400">هنوز پاسخی ثبت نشده است.</div>
              ) : (
                <div className="space-y-2">
                  {replies.map((r) => (
                    <div key={r.id} className="text-xs bg-white p-2.5 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">@{r.author?.username || "user"}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Intl.DateTimeFormat("fa-IR", { timeStyle: "short" }).format(new Date(r.createdAt))}
                        </span>
                      </div>
                      <p className="text-gray-700">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}