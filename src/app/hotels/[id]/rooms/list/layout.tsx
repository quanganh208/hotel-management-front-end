import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách phòng | HotelManager Pro",
  description: "Xem và quản lý danh sách phòng trong khách sạn",
};

export default function RoomListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
