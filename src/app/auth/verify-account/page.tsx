import type { Metadata } from "next";
import Image from "next/image";
import VerifyAccountForm from "@/components/auth/verify-account-form";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Khách sạn | Xác thực",
  description: "Xác thực tài khoản để sử dụng Hệ thống Quản lý Khách sạn",
};

export default function VerifyAccountPage() {
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

      {/* Right side - Verification form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="mx-auto w-full max-w-md p-8">
          <VerifyAccountForm />
        </div>
      </div>
    </div>
  );
}
