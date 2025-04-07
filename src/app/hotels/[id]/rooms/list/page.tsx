"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumberWithCommas } from "@/lib/utils";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import { useRoomStore } from "@/store/rooms";
import { Room, RoomWithType, RoomStatus } from "@/types/room";
import { toast } from "sonner";
import { CreateRoomDialog } from "@/components/hotels/rooms/create-room-dialog";
import { RoomDetailDialog } from "@/components/hotels/rooms/room-detail-dialog";

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

export default function RoomsPage() {
  const params = useParams();
  const hotelId = params?.id as string;

  const { rooms, error, fetchRooms, isFetching } = useRoomStore();

  const [selectedRoom, setSelectedRoom] = useState<RoomWithType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  const loadData = useCallback(async () => {
    if (!hotelId) return;

    try {
      setIsLoadingLocal(true);
      await fetchRooms(hotelId);
    } catch (error) {
      toast.error("Không thể tải danh sách phòng");
      console.error("Error fetching rooms:", error);
    } finally {
      setIsLoadingLocal(false);
    }
  }, [fetchRooms, hotelId]);

  useEffect(() => {
    // Luôn load dữ liệu khi component mount
    loadData();
  }, [loadData]);

  const handleRowClick = (room: RoomWithType) => {
    setSelectedRoom(room);
    setDetailOpen(true);
  };

  // Filter to only show rooms for this hotel
  const filteredRooms = rooms.filter((room) => room.hotelId === hotelId);

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return "bg-green-500";
      case RoomStatus.OCCUPIED:
        return "bg-purple-500";
      case RoomStatus.BOOKED:
        return "bg-blue-500";
      case RoomStatus.CHECKED_IN:
        return "bg-indigo-500";
      case RoomStatus.CHECKED_OUT:
        return "bg-amber-500";
      case RoomStatus.CLEANING:
        return "bg-cyan-500";
      case RoomStatus.MAINTENANCE:
        return "bg-red-500";
      case RoomStatus.OUT_OF_SERVICE:
        return "bg-gray-500";
      case RoomStatus.RESERVED:
        return "bg-teal-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Room["status"]) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return "Trống";
      case RoomStatus.OCCUPIED:
        return "Đang sử dụng";
      case RoomStatus.BOOKED:
        return "Đã đặt trước";
      case RoomStatus.CHECKED_IN:
        return "Đã nhận phòng";
      case RoomStatus.CHECKED_OUT:
        return "Đã trả phòng";
      case RoomStatus.CLEANING:
        return "Đang dọn dẹp";
      case RoomStatus.MAINTENANCE:
        return "Bảo trì";
      case RoomStatus.OUT_OF_SERVICE:
        return "Ngừng sử dụng";
      case RoomStatus.RESERVED:
        return "Đã giữ chỗ";
      default:
        return status;
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
                    <BreadcrumbPage>Phòng</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Danh sách phòng</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-background md:min-h-min p-6">
              <div className="flex items-center justify-between mb-6">
                <motion.h1
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Danh sách phòng
                </motion.h1>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <CreateRoomDialog />
                </motion.div>
              </div>

              <AnimatePresence mode="wait">
                {isLoadingLocal || isFetching ? (
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
                    <Button variant="outline" onClick={loadData}>
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
                    {filteredRooms.length === 0 ? (
                      <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
                      >
                        <p className="text-lg">Chưa có phòng nào</p>
                        <p className="text-sm mt-2">
                          Hãy tạo phòng đầu tiên cho khách sạn
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="rounded-md border"
                        variants={itemVariants}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-medium">
                                Tên phòng
                              </TableHead>
                              <TableHead className="font-medium">
                                Hạng phòng
                              </TableHead>
                              <TableHead className="font-medium">
                                Khu vực
                              </TableHead>
                              <TableHead className="font-medium text-right">
                                Giá giờ (VNĐ)
                              </TableHead>
                              <TableHead className="font-medium text-right">
                                Giá cả ngày (VNĐ)
                              </TableHead>
                              <TableHead className="font-medium text-right">
                                Giá qua đêm (VNĐ)
                              </TableHead>
                              <TableHead className="font-medium text-center">
                                Trạng thái
                              </TableHead>
                              <TableHead className="font-medium">
                                Ghi chú
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {filteredRooms.map((room) => (
                                <motion.tr
                                  key={room._id}
                                  variants={itemVariants}
                                  className="cursor-pointer bg-muted/30"
                                  onClick={() => handleRowClick(room)}
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                    transition: { duration: 0.2 },
                                  }}
                                  layout
                                >
                                  <TableCell className="font-medium">
                                    Phòng {room.roomNumber}
                                  </TableCell>
                                  <TableCell>
                                    {room.roomTypeId?.name || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {room.floor ? `Tầng ${room.floor}` : "N/A"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {room.roomTypeId?.pricePerHour
                                      ? formatNumberWithCommas(
                                          room.roomTypeId.pricePerHour
                                        )
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {room.roomTypeId?.pricePerDay
                                      ? formatNumberWithCommas(
                                          room.roomTypeId.pricePerDay
                                        )
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {room.roomTypeId?.priceOvernight
                                      ? formatNumberWithCommas(
                                          room.roomTypeId.priceOvernight
                                        )
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="outline"
                                      className={`${getStatusColor(
                                        room.status
                                      )} text-white`}
                                    >
                                      {getStatusText(room.status)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {room.note || ""}
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

      {selectedRoom && (
        <RoomDetailDialog
          room={selectedRoom}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
}
