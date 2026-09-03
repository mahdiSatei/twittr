"use client";

import { useState } from "react";

interface PostComposerProps {
  onPostCreated: () => void;
  currentUserAvatar?: string | null;
}

const MAX_CHARS = 280;

export default function PostComposer({ onPostCreated, currentUserAvatar }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isDisabled = content.trim().length === 0 || isOverLimit || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to post");
      }

      setContent("");
      onPostCreated();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {currentUserAvatar ? (
              <img
                src={currentUserAvatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                ?
              </div>
            )}
          </div>
          <div className="flex-grow">
            <textarea
              className="w-full resize-none border-none outline-none text-gray-900 placeholder-gray-400 text-base"
              rows={3}
              placeholder="What is happening?!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHARS + 50} // slight buffer so user notices the counter in red
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
          {/* TODO: Phase 2 - Add media upload icons here */}
          <span
            className={`text-xs font-semibold ${
              isOverLimit ? "text-red-500" : remaining <= 20 ? "text-amber-500" : "text-gray-400"
            }`}
          >
            {remaining} left
          </span>
          <button
            type="submit"
            disabled={isDisabled}
            className="px-4 py-1.5 bg-blue-500 text-white font-semibold rounded-full text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}