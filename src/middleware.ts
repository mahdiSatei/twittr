import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = ["/profile/edit"];
const AUTH_ROUTES = ["/login", "/register"];
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_dev_secret_key_at_least_32_characters"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  let isAuthenticated = false;
  let userRole: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      isAuthenticated = true;
      userRole = (payload as any).role || "USER";
    } catch {
      isAuthenticated = false;
    }
  }

  // ۱. محافظت از مسیر پنل مدیریت (فقط ADMIN)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (userRole !== "ADMIN") {
      // کاربر عادی به اکسپلور هدایت می‌شود
      return NextResponse.redirect(new URL("/explore", request.url));
    }
  }

  // ۲. ریدایرکت کاربران احرازنشده به لاگین
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ۳. ریدایرکت کاربر لاگین‌شده از صفحات ورود/ثبت‌نام
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/explore", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/edit", "/login", "/register"],
};