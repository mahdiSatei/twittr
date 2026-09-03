"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, User, LogOut, LogIn, UserPlus } from "lucide-react";

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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/explore" className="text-xl font-bold text-blue-500 tracking-tight flex items-center gap-2">
          <span>XPart</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md transition"
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </Link>

          {currentUser ? (
            <>
              {/* TODO: Phase 2 - Notifications Button */}
              {/* TODO: Phase 2 - Direct Messages Button */}
              <Link
                href={`/profile/${currentUser.username}`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md transition"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 border border-gray-300 rounded-full transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-full transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}