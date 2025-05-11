import { verifyTurnstileToken } from "@/lib/turnstile-config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Thiếu token captcha" },
        { status: 400 }
      );
    }

    const isValid = await verifyTurnstileToken(token);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Xác thực captcha thất bại" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi xác thực captcha:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server khi xác thực captcha" },
      { status: 500 }
    );
  }
}
