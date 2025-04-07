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
import Header from "@/components/header";
import { useRoomCategoryStore } from "@/store/room-categories";
import { RoomCategory } from "@/types/room";
import { toast } from "sonner";
import { CreateRoomCategoryDialog } from "@/components/hotels/rooms/create-room-category-dialog";
import { RoomCategoryDetailDialog } from "@/components/hotels/rooms/room-category-detail-dialog";

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

export default function RoomCategoriesPage() {
  const params = useParams();
  const hotelId = params?.id as string;

  const { roomCategories, error, fetchRoomCategories, isFetching } =
    useRoomCategoryStore();

  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  const loadData = useCallback(async () => {
    if (!hotelId) return;

    try {
      setIsLoadingLocal(true);
      await fetchRoomCategories(hotelId);
    } catch (error) {
      toast.error("Không thể tải danh sách hạng phòng");
      console.error("Error fetching room categories:", error);
    } finally {
      setIsLoadingLocal(false);
    }
  }, [fetchRoomCategories, hotelId]);

  useEffect(() => {
    // Luôn load dữ liệu khi component mount
    loadData();
  }, [loadData]);

  const handleRowClick = (category: RoomCategory) => {
    setSelectedCategory(category);
    setDetailOpen(true);
  };

  // Filter to only show categories for this hotel
  const filteredCategories = roomCategories.filter(
    (category) => category.hotelId === hotelId
  );

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
                    <BreadcrumbPage>Hạng phòng</BreadcrumbPage>
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
                  Danh sách hạng phòng
                </motion.h1>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <CreateRoomCategoryDialog />
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
                    {filteredCategories.length === 0 ? (
                      <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
                      >
                        <p className="text-lg">Chưa có hạng phòng nào</p>
                        <p className="text-sm mt-2">
                          Hãy tạo hạng phòng đầu tiên
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
                                Tên hạng phòng
                              </TableHead>
                              <TableHead className="font-medium">
                                Mô tả
                              </TableHead>
                              <TableHead className="font-medium text-center">
                                Số lượng phòng
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
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {filteredCategories.map((category) => (
                                <motion.tr
                                  key={category._id}
                                  variants={itemVariants}
                                  className="cursor-pointer bg-muted/30"
                                  onClick={() => handleRowClick(category)}
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                    transition: { duration: 0.2 },
                                  }}
                                  layout
                                >
                                  <TableCell className="font-medium">
                                    {category.name}
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {category.description}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {category.rooms.length}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatNumberWithCommas(
                                      category.pricePerHour
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatNumberWithCommas(
                                      category.pricePerDay
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatNumberWithCommas(
                                      category.priceOvernight
                                    )}
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

      {selectedCategory && (
        <RoomCategoryDetailDialog
          category={selectedCategory}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
}
