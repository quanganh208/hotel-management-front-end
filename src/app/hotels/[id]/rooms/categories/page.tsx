"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatNumberWithCommas } from "@/lib/utils";

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
import { CreateRoomCategoryDialog } from "@/components/rooms/create-room-category-dialog";
import { RoomCategoryDetailDialog } from "@/components/rooms/room-category-detail-dialog";
import { useRoomCategoryStore } from "@/store/room-categories";
import { RoomCategory } from "@/types/room";

export default function RoomCategoriesPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    roomCategories,
    isLoading,
    error,
    fetchRoomCategories,
    isInitialized,
  } = useRoomCategoryStore();

  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchRoomCategories().then((r) => r);
  }, [fetchRoomCategories]);

  const handleRowClick = (category: RoomCategory) => {
    setSelectedCategory(category);
    setDetailOpen(true);
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
                    <BreadcrumbPage>Hạng phòng</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-background md:min-h-min p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Danh sách hạng phòng</h1>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CreateRoomCategoryDialog />
                </motion.div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-[400px] text-destructive">
                  {error}
                </div>
              ) : !isInitialized ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-medium">
                          Tên hạng phòng
                        </TableHead>
                        <TableHead className="font-medium">Mô tả</TableHead>
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
                      {roomCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            Chưa có hạng phòng nào. Hãy tạo hạng phòng đầu tiên.
                          </TableCell>
                        </TableRow>
                      ) : (
                        roomCategories.map((category) => (
                          <TableRow
                            key={category._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleRowClick(category)}
                          >
                            <TableCell className="font-medium">
                              {category.name}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {category.description}
                            </TableCell>
                            <TableCell className="text-center">
                              {category.roomCount}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumberWithCommas(category.hourlyPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumberWithCommas(category.dailyPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumberWithCommas(category.overnightPrice)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
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
