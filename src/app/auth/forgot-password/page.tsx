import type { Metadata } from "next";
import Image from "next/image";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Khách sạn | Quên mật khẩu",
  description:
    "Đặt lại mật khẩu cho tài khoản Hệ thống Quản lý Khách sạn của bạn",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Image */}
      <div className="hidden w-1/2 bg-muted lg:block">
        <div className="relative h-full w-full">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Hotel lobby"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      {/* Right side - Forgot Password form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="mx-auto w-full max-w-md p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
