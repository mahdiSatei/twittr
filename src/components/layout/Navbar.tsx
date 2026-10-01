"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Compass, User, LogOut, LogIn, UserPlus, Rss } from "lucide-react";

interface NavbarProps {
  currentUser: {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export default function Navbar({ currentUser }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/explore" className="text-xl font-bold text-blue-500 tracking-tight">
          chirp
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {/* تب اکسپلور */}
          <Link
            href="/explore"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition ${
              pathname === "/explore" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </Link>

          {/* تب تایم‌لاین (فقط برای کاربران لاگین‌شده) */}
          {currentUser && (
            <Link
              href="/timeline"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition ${
                pathname === "/timeline" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Rss className="w-4 h-4" />
              <span>Timeline</span>
            </Link>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${currentUser.username}`}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>@{currentUser.username}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-full transition"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600"
              >
                <UserPlus className="w-4 h-4" />
                <span>ثبت‌نام</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}