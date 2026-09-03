import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chirp — Twitter Clone",
  description: "Phase 1: Twitter-like System (Auth + Profile + Posts + Explore)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}