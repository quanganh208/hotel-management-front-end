import { Suspense } from "react";
import { Metadata } from "next";
import LoadingPage from "@/components/ui/loading-page";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Khách sạn | Xác thực",
  description: "Hệ thống Quản lý Khách sạn - Trang xác thực người dùng",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<LoadingPage text="Đang tải..." />}>
      {children}
    </Suspense>
  );
}
