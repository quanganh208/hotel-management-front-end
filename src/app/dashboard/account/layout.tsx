import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài khoản | HotelManager Pro",
  description: "Quản lý thông tin tài khoản của bạn",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
