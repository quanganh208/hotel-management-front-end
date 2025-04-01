import type {Metadata} from "next";

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
    <div>{children}</div>
  )
}
