import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Khách sạn | Đặt lại mật khẩu",
  description:
    "Đặt lại mật khẩu cho tài khoản Hệ thống Quản lý Khách sạn của bạn",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
