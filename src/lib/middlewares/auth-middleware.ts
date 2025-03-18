import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function authMiddleware(request: NextRequest) {
  const session = await auth();

  // Kiểm tra nếu người dùng chưa đăng nhập và đang cố truy cập trang cần xác thực
  if (!session) {
    // Lưu URL hiện tại để chuyển hướng trở lại sau khi đăng nhập
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
