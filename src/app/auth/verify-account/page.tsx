import type { Metadata } from "next";
import Image from "next/image";
import VerifyAccountForm from "@/components/auth/verify-account-form";
import Background from "../../../../public/background.png";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Khách sạn | Xác thực",
  description: "Xác thực tài khoản để sử dụng Hệ thống Quản lý Khách sạn",
};

export default function VerifyAccountPage() {
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

      {/* Right side - Verification form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="mx-auto w-full max-w-md p-8">
          <VerifyAccountForm />
        </div>
      </div>
    </div>
  );
}
