export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { buildLogoutCookie } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set(buildLogoutCookie());
  return response;
}