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

export const CleaningHistoryTab: React.FC = () => {
  // Dữ liệu mẫu - sẽ được thay thế bằng API sau này
  const cleaningHistory = [
    {
      id: 1,
      date: "2023-10-13 13:30",
      cleaner: "Nguyễn Thị L",
      status: "completed",
      notes: "Dọn dẹp tiêu chuẩn sau khi khách trả phòng",
    },
    {
      id: 2,
      date: "2023-11-06 12:45",
      cleaner: "Trần Văn M",
      status: "completed",
      notes: "Thay mới toàn bộ khăn, ga trải giường",
    },
    {
      id: 3,
      date: "2023-12-24 15:30",
      cleaner: "Lê Thị N",
      status: "incomplete",
      notes: "Cần kiểm tra lại nhà vệ sinh",
    },
    {
      id: 4,
      date: "2024-01-03 13:30",
      cleaner: "Phạm Văn P",
      status: "completed",
      notes: "Dọn dẹp toàn diện, xử lý vết bẩn trên thảm",
    },
    {
      id: 5,
      date: "2024-02-15 14:15",
      cleaner: "Nguyễn Thị L",
      status: "scheduled",
      notes: "Dọn dẹp định kỳ hàng tháng",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      case "incomplete":
        return <Badge variant="destructive">Chưa hoàn thành</Badge>;
      case "scheduled":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            Đã lên lịch
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
            <TableHead className="font-medium">Ngày giờ</TableHead>
            <TableHead className="font-medium">Nhân viên</TableHead>
            <TableHead className="font-medium">Trạng thái</TableHead>
            <TableHead className="font-medium">Ghi chú</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cleaningHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                Chưa có lịch sử dọn phòng.
              </TableCell>
            </TableRow>
          ) : (
            cleaningHistory.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.date}</TableCell>
                <TableCell className="font-medium">{record.cleaner}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>{record.notes}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
