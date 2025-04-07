import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const BookingHistoryTab: React.FC = () => {
  // Dữ liệu mẫu - sẽ được thay thế bằng API sau này
  const bookings = [
    {
      id: 1,
      guestName: "Nguyễn Văn A",
      checkIn: "2023-10-12 14:00",
      checkOut: "2023-10-13 12:00",
      status: "completed",
      totalAmount: "850,000",
    },
    {
      id: 2,
      guestName: "Trần Thị B",
      checkIn: "2023-11-05 15:30",
      checkOut: "2023-11-06 11:00",
      status: "completed",
      totalAmount: "950,000",
    },
    {
      id: 3,
      guestName: "Lê Văn C",
      checkIn: "2023-12-24 13:00",
      checkOut: "2023-12-25 12:00",
      status: "cancelled",
      totalAmount: "1,200,000",
    },
    {
      id: 4,
      guestName: "Phạm Thị D",
      checkIn: "2024-01-01 14:00",
      checkOut: "2024-01-03 12:00",
      status: "completed",
      totalAmount: "1,800,000",
    },
    {
      id: 5,
      guestName: "Hoàng Văn E",
      checkIn: "2024-05-01 14:00",
      checkOut: "2024-05-03 12:00",
      status: "upcoming",
      totalAmount: "1,750,000",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      case "upcoming":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            Sắp tới
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border h-full overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Khách hàng</TableHead>
            <TableHead className="font-medium">Nhận phòng</TableHead>
            <TableHead className="font-medium">Trả phòng</TableHead>
            <TableHead className="font-medium">Số tiền</TableHead>
            <TableHead className="font-medium">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                Chưa có lịch sử đặt phòng.
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.guestName}
                </TableCell>
                <TableCell>{booking.checkIn}</TableCell>
                <TableCell>{booking.checkOut}</TableCell>
                <TableCell>{booking.totalAmount} VNĐ</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
