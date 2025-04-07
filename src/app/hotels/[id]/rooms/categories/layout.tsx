import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách hạng phòng | HotelManager Pro",
  description: "Xem và quản lý danh sách hạng phòng trong khách sạn",
};

export default function RoomCategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
