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

export const TransactionHistoryTab: React.FC = () => {
  // Dữ liệu mẫu - sẽ được thay thế bằng API sau này
  const transactions = [
    {
      id: "TX12345",
      date: "2023-10-13 12:15",
      amount: "850,000",
      type: "payment",
      method: "Tiền mặt",
      employee: "Nguyễn Thị G",
    },
    {
      id: "TX12346",
      date: "2023-11-06 11:30",
      amount: "950,000",
      type: "payment",
      method: "Chuyển khoản",
      employee: "Trần Văn H",
    },
    {
      id: "TX12347",
      date: "2023-12-24 10:00",
      amount: "500,000",
      type: "deposit",
      method: "Thẻ tín dụng",
      employee: "Lê Thị I",
    },
    {
      id: "TX12348",
      date: "2023-12-24 14:30",
      amount: "500,000",
      type: "refund",
      method: "Tiền mặt",
      employee: "Phạm Văn K",
    },
    {
      id: "TX12349",
      date: "2024-01-03 12:30",
      amount: "1,800,000",
      type: "payment",
      method: "Tiền mặt",
      employee: "Trần Văn H",
    },
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "payment":
        return <Badge className="bg-green-500">Thanh toán</Badge>;
      case "deposit":
        return <Badge className="bg-blue-500">Đặt cọc</Badge>;
      case "refund":
        return <Badge variant="destructive">Hoàn tiền</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="rounded-md border h-full overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Mã giao dịch</TableHead>
            <TableHead className="font-medium">Ngày giờ</TableHead>
            <TableHead className="font-medium">Loại</TableHead>
            <TableHead className="font-medium">Phương thức</TableHead>
            <TableHead className="font-medium">Số tiền</TableHead>
            <TableHead className="font-medium">Nhân viên</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                Chưa có lịch sử giao dịch.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                <TableCell>{transaction.method}</TableCell>
                <TableCell>{transaction.amount} VNĐ</TableCell>
                <TableCell>{transaction.employee}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
