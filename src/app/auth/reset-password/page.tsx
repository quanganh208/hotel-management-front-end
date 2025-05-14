"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingPage from "@/components/ui/loading-page";
import Background from "../../../../public/background.png";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Nếu không có token, chuyển hướng đến trang quên mật khẩu
  useEffect(() => {
    if (!token) {
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu
            cầu liên kết mới.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Image */}
      <div className="hidden w-1/2 bg-muted lg:block relative overflow-hidden">
        <div className="relative h-full w-full">
          <Image
            src={Background}
            alt="Hotel lobby"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />

          {/* Overlay content */}
          <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
            <div className="mb-2">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Hệ thống Quản lý Khách sạn
              </h1>
              <p className="text-lg opacity-90 max-w-md">
                Giải pháp toàn diện để quản lý mọi khía cạnh của doanh nghiệp
                khách sạn của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Reset Password form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="mx-auto w-full max-w-md p-8">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingPage text="Đang xử lý yêu cầu..." />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
