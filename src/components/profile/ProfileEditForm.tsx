"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Lock } from "lucide-react";

interface ProfileEditFormProps {
  initialUser: {
    username: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    isPrivate?: boolean;
  };
}

export default function ProfileEditForm({ initialUser }: ProfileEditFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialUser.displayName || "");
  const [bio, setBio] = useState(initialUser.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl || "");
  const [isPrivate, setIsPrivate] = useState(Boolean(initialUser.isPrivate));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAvatarUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, avatarUrl, isPrivate }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      router.push(`/profile/${initialUser.username}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      {/* تغییر آواتار */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">تصویر آواتار</label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              بدون تصویر
            </div>
          )}
          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            <span>{uploading ? "در حال آپلود..." : "آپلود تصویر جدید"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">نام نمایشی</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">بیوگرافی</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* سوئیچ حساب خصوصی (Private Profile) */}
      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">حساب خصوصی (Private Account)</p>
            <p className="text-xs text-gray-500">پست‌های شما فقط برای کسانی که شما را دنبال می‌کنند نمایش داده شود.</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="px-4 py-1.5 border rounded-full text-sm">
          انصراف
        </button>
        <button type="submit" disabled={saving || uploading} className="px-5 py-1.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600">
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}