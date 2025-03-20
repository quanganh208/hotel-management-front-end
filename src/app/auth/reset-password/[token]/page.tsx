import type { Metadata } from "next";
import Image from "next/image";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Khách sạn | Đặt lại mật khẩu",
  description:
    "Đặt lại mật khẩu cho tài khoản Hệ thống Quản lý Khách sạn của bạn",
};

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
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

      {/* Right side - Reset Password form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="mx-auto w-full max-w-md p-8">
          <ResetPasswordForm token={params.token} />
        </div>
      </div>
    </div>
  );
}
