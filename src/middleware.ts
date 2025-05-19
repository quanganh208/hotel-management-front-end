import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Danh sách các route công khai không cần xác thực
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-account",
  "/auth/error",
];

// Danh sách các API routes không cần xác thực
const publicApiRoutes = ["/api/auth"];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  // Kiểm tra xem route hiện tại có nằm trong danh sách route công khai không
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Kiểm tra xem có phải API route công khai không
  const isPublicApiRoute = publicApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Nếu người dùng chưa đăng nhập và đang truy cập route yêu cầu xác thực
  if (!token && !isPublicRoute && !isPublicApiRoute) {
    // Nếu là API request, trả về lỗi Unauthorized
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({
          error: "unauthorized",
          message: "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn",
        }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Nếu là route thông thường, chuyển hướng đến trang đăng nhập
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Nếu người dùng đã đăng nhập và đang truy cập trang đăng nhập hoặc đăng ký
  if (
    token &&
    (pathname === "/auth/login" ||
      pathname === "/auth/register" ||
      pathname === "/auth/forgot-password" ||
      pathname === "/auth/reset-password" ||
      pathname === "/auth/verify-account")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Thêm token vào header request để gửi đến API backend
  if (
    token &&
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth")
  ) {
    const requestHeaders = new Headers(request.headers);
    const accessToken = token.accessToken as string;
    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route cần xác thực
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /_static (static files)
     * 3. /favicon.ico, /sitemap.xml (static files)
     * 4. /public (public files)
     */
    "/((?!_next|_static|favicon.ico|sitemap.xml|public).*)",
  ],
};
