"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, FileDown, Loader2, User, Users, Clock } from "lucide-react";

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
import { useBookingStore, Booking } from "@/store/booking";

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

// Booking Detail Dialog Component
function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!booking) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-primary" />
            Chi tiết đặt phòng
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về lịch đặt phòng
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
                  <div className="text-muted-foreground">Họ tên:</div>
                  <div className="font-medium">{booking.guestName}</div>

                  <div className="text-muted-foreground">Số điện thoại:</div>
                  <div>{booking.phoneNumber}</div>

                  <div className="text-muted-foreground">Số lượng khách:</div>
                  <div>{booking.guestCount} người</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Thông tin đặt phòng
                </h3>
                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <div className="text-muted-foreground">Phòng:</div>
                  <div className="font-medium">
                    {booking.roomId.roomNumber} (Tầng {booking.roomId.floor})
                  </div>

                  <div className="text-muted-foreground">Nhận phòng:</div>
                  <div>{formatDate(booking.checkInDate)}</div>

                  <div className="text-muted-foreground">Trả phòng:</div>
                  <div>{formatDate(booking.checkOutDate)}</div>

                  <div className="text-muted-foreground">Ngày tạo:</div>
                  <div>{formatDate(booking.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {booking.note && (
            <div>
              <h3 className="text-lg font-semibold mb-1">Ghi chú</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {booking.note}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-1">Thông tin người tạo</h3>
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <div className="text-muted-foreground">Tên:</div>
              <div className="font-medium">{booking.createdBy.name}</div>

              <div className="text-muted-foreground">Email:</div>
              <div>{booking.createdBy.email}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BookingsPage() {
  const params = useParams();
  const hotelId = params?.id as string;
  const [detailOpen, setDetailOpen] = useState(false);

  // Sử dụng booking store từ Zustand
  const {
    bookings,
    fetchBookings,
    selectedBooking,
    selectBooking,
    isFetching,
    error,
  } = useBookingStore();

  // Lấy dữ liệu đặt phòng khi component được mount
  useEffect(() => {
    if (hotelId) {
      fetchBookings(hotelId);
    }
  }, [hotelId, fetchBookings]);

  const handleExport = () => {
    toast.info("Tính năng xuất file sẽ được phát triển sau");
  };

  const handleRowClick = (booking: Booking) => {
    selectBooking(booking);
    setDetailOpen(true);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
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
                    <BreadcrumbPage>Đặt phòng</BreadcrumbPage>
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
                    <Calendar className="h-8 w-8 mr-2 text-primary" />
                    Quản lý đặt phòng
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Quản lý danh sách đặt phòng và lịch trình
                  </p>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" /> Xuất file
                  </Button>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {isFetching ? (
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
                    <Button
                      variant="outline"
                      onClick={() => fetchBookings(hotelId)}
                    >
                      Thử lại
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    {bookings.length === 0 ? (
                      <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
                      >
                        <p className="text-lg">Chưa có đặt phòng nào</p>
                        <p className="text-sm mt-2">
                          Hãy tạo đơn đặt phòng đầu tiên
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
                                  Khách hàng
                                </div>
                              </TableHead>
                              <TableHead className="font-medium">
                                <div className="flex items-center">Phòng</div>
                              </TableHead>
                              <TableHead className="font-medium w-[180px]">
                                <div className="flex items-center">
                                  Nhận phòng
                                </div>
                              </TableHead>
                              <TableHead className="font-medium w-[180px]">
                                <div className="flex items-center">
                                  Trả phòng
                                </div>
                              </TableHead>
                              <TableHead className="font-medium text-center">
                                <div className="flex items-center justify-center">
                                  Số lượng
                                </div>
                              </TableHead>
                              <TableHead className="font-medium">
                                <div className="flex items-center">
                                  Người tạo
                                </div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {bookings.map((booking) => (
                                <motion.tr
                                  key={booking._id}
                                  variants={itemVariants}
                                  className="cursor-pointer bg-muted/30"
                                  onClick={() => handleRowClick(booking)}
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                    transition: { duration: 0.2 },
                                  }}
                                  layout
                                >
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {booking.guestName}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {booking.phoneNumber}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-500 text-white"
                                    >
                                      {booking.roomId.roomNumber}
                                    </Badge>
                                    <span className="ml-2 text-sm text-muted-foreground">
                                      Tầng {booking.roomId.floor}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                      {formatDate(booking.checkInDate)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                      {formatDate(booking.checkOutDate)}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                      {booking.guestCount}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5">
                                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                                      {booking.createdBy.name}
                                    </div>
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

      {selectedBooking && (
        <BookingDetailDialog
          booking={selectedBooking}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
}
