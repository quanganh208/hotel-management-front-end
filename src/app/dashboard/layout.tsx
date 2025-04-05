import { Suspense } from "react";
import type { Metadata } from "next";
import LoadingPage from "@/components/ui/loading-page";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Khách sạn | Trang chủ",
  description: "Hệ thống Quản lý Khách sạn - Trang chủ",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Suspense fallback={<LoadingPage text="Đang tải dashboard..." />}>
        {children}
      </Suspense>
    </div>
  );
}
