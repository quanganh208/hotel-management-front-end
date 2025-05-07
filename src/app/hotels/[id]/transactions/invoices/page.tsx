"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FileText,
  FileDown,
  Loader2,
  Hash,
  Calendar,
  DollarSign,
  Receipt,
  Tag,
} from "lucide-react";

import { AppSidebar } from "@/components/hotels/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Header from "@/components/header";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200,
    },
  },
};

// Define invoice item type
interface InvoiceItem {
  itemId: string;
  name: string;
  itemCode: string | null;
  type: string;
  quantity: number;
  price: number;
  amount: number;
  note: string;
}

// Define invoice type
interface Invoice {
  _id: string;
  hotelId: string;
  invoiceCode: string;
  invoiceType: string;
  roomId: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  note: string;
  checkInDate: string;
  checkOutDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

// Invoice Detail Dialog Component
function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!invoice) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getInvoiceTypeText = (type: string) => {
    switch (type) {
      case "room":
        return "Phòng";
      case "service":
        return "Dịch vụ";
      case "food":
        return "Thực phẩm";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500">Đang mở</Badge>;
      case "paid":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5 text-primary" />
            Chi tiết hoá đơn
          </DialogTitle>
          <DialogDescription>
            Mã hoá đơn: {invoice.invoiceCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <div className="text-muted-foreground">Khách hàng:</div>
                  <div className="font-medium">{invoice.customerName}</div>

                  <div className="text-muted-foreground">Số điện thoại:</div>
                  <div>{invoice.customerPhone}</div>

                  <div className="text-muted-foreground">Loại hoá đơn:</div>
                  <div>{getInvoiceTypeText(invoice.invoiceType)}</div>

                  <div className="text-muted-foreground">Trạng thái:</div>
                  <div>{getStatusBadge(invoice.status)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Thông tin thời gian
                </h3>
                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <div className="text-muted-foreground">Ngày tạo:</div>
                  <div>{formatDate(invoice.createdAt)}</div>

                  <div className="text-muted-foreground">Nhận phòng:</div>
                  <div>{formatDate(invoice.checkInDate)}</div>

                  <div className="text-muted-foreground">Trả phòng:</div>
                  <div>{formatDate(invoice.checkOutDate)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chi tiết hoá đơn</h3>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium">Mô tả</TableHead>
                    <TableHead className="font-medium text-right">
                      Số lượng
                    </TableHead>
                    <TableHead className="font-medium text-right">
                      Đơn giá
                    </TableHead>
                    <TableHead className="font-medium text-right">
                      Thành tiền
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        {item.note && (
                          <div className="text-sm text-muted-foreground">
                            {item.note}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)} đ
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)} đ
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow className="border-t-2">
                    <TableCell colSpan={3} className="text-right font-medium">
                      Tổng tiền:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(invoice.totalAmount)} đ
                    </TableCell>
                  </TableRow>

                  {invoice.discount > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Giảm giá:
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        -{formatCurrency(invoice.discount)} đ
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={3} className="text-right font-bold">
                      Thành tiền:
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {formatCurrency(invoice.finalAmount)} đ
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {invoice.note && (
            <div>
              <h3 className="text-lg font-semibold mb-1">Ghi chú</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line p-3 bg-muted/30 rounded-md">
                {invoice.note}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button>In hoá đơn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function InvoicesPage() {
  const params = useParams();
  const hotelId = params?.id as string;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/invoices`, {
          params: { hotelId },
        });
        setInvoices(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setError("Không thể tải danh sách hoá đơn. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    if (hotelId) {
      fetchInvoices();
    }
  }, [hotelId]);

  const handleExport = () => {
    toast.info("Tính năng xuất file sẽ được phát triển sau");
  };

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getInvoiceTypeText = (type: string) => {
    switch (type) {
      case "room":
        return "Phòng";
      case "service":
        return "Dịch vụ";
      case "food":
        return "Thực phẩm";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500 text-white">Đang mở</Badge>;
      case "paid":
        return <Badge className="bg-green-500 text-white">Đã thanh toán</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Giao dịch</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Hoá đơn</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-background md:min-h-min p-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <Receipt className="h-8 w-8 mr-2 text-primary" />
                    Quản lý hoá đơn
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Quản lý và theo dõi hoá đơn của khách sạn
                  </p>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" /> Xuất file
                  </Button>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    className="flex items-center justify-center h-[400px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    className="flex flex-col items-center justify-center h-[400px] text-destructive gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{error}</p>
                    <Button variant="outline">Thử lại</Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    {invoices.length === 0 ? (
                      <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
                      >
                        <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg">Chưa có hoá đơn nào</p>
                        <p className="text-sm mt-2">
                          Hệ thống sẽ tự động tạo hoá đơn khi có giao dịch
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="rounded-md border overflow-hidden"
                        variants={itemVariants}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted">
                              <TableHead className="font-medium">
                                <div className="flex items-center">
                                  Mã hoá đơn
                                </div>
                              </TableHead>
                              <TableHead className="font-medium">
                                <div className="flex items-center">
                                  Khách hàng
                                </div>
                              </TableHead>
                              <TableHead className="font-medium">
                                <div className="flex items-center">Loại</div>
                              </TableHead>
                              <TableHead className="font-medium w-[180px]">
                                <div className="flex items-center">
                                  Ngày tạo
                                </div>
                              </TableHead>
                              <TableHead className="font-medium text-right">
                                <div className="flex items-center justify-end">
                                  Tổng tiền
                                </div>
                              </TableHead>
                              <TableHead className="font-medium text-center">
                                <div className="flex items-center justify-center">
                                  Trạng thái
                                </div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {invoices.map((invoice) => (
                                <motion.tr
                                  key={invoice._id}
                                  variants={itemVariants}
                                  className="cursor-pointer bg-muted/30"
                                  onClick={() => handleRowClick(invoice)}
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                    transition: { duration: 0.2 },
                                  }}
                                  layout
                                >
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Hash className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                      <span className="font-medium">
                                        {invoice.invoiceCode}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {invoice.customerName}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {invoice.customerPhone}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Tag className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                      {getInvoiceTypeText(invoice.invoiceType)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                      {formatDate(invoice.createdAt)}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="font-medium">
                                        {formatCurrency(invoice.finalAmount)} đ
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {getStatusBadge(invoice.status)}
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </TableBody>
                        </Table>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {selectedInvoice && (
        <InvoiceDetailDialog
          invoice={selectedInvoice}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
}
