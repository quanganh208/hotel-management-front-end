"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, FileUp, Loader2 } from "lucide-react";

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
import { useStaffStore } from "@/store/staff";
import { Staff, StaffRole } from "@/types/staff";
import { toast } from "sonner";
import { CreateStaffDialog } from "@/components/hotels/staff/create-staff-dialog";
import { StaffDetailDialog } from "@/components/hotels/staff/staff-detail-dialog";

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

export default function StaffPage() {
  const params = useParams();
  const hotelId = params?.id as string;

  const { staff, error, fetchStaff, isFetching } = useStaffStore();

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  const loadData = useCallback(async () => {
    if (!hotelId) return;

    try {
      setIsLoadingLocal(true);
      await fetchStaff(hotelId);
    } catch (error) {
      toast.error("Không thể tải danh sách nhân viên");
      console.error("Error fetching staff:", error);
    } finally {
      setIsLoadingLocal(false);
    }
  }, [fetchStaff, hotelId]);

  useEffect(() => {
    // Luôn load dữ liệu khi component mount
    loadData();
  }, [loadData]);

  const handleRowClick = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setDetailOpen(true);
  };

  // Hiển thị nhãn chức vụ
  const getRoleLabel = (role: StaffRole) => {
    switch (role) {
      case StaffRole.MANAGER:
        return "Quản lý";
      case StaffRole.RECEPTIONIST:
        return "Lễ tân";
      case StaffRole.HOUSEKEEPING:
        return "Phục vụ";
      case StaffRole.ACCOUNTANT:
        return "Kế toán";
      default:
        return role;
    }
  };

  // Xử lý nhập file
  const handleImport = () => {
    toast.info("Tính năng nhập file sẽ được phát triển sau");
  };

  // Xử lý xuất file
  const handleExport = () => {
    toast.info("Tính năng xuất file sẽ được phát triển sau");
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
                    <BreadcrumbPage>Nhân viên</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Danh sách nhân viên</BreadcrumbPage>
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
                  Danh sách nhân viên
                </motion.h1>
                <motion.div
                  className="flex space-x-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Button variant="outline" onClick={handleImport}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Nhập file
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Xuất file
                  </Button>
                  <CreateStaffDialog />
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
                    {staff.length === 0 ? (
                      <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
                      >
                        <p className="text-lg">Chưa có nhân viên nào</p>
                        <p className="text-sm mt-2">
                          Hãy thêm nhân viên đầu tiên cho khách sạn
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
                                Mã nhân viên
                              </TableHead>
                              <TableHead className="font-medium">
                                Tên nhân viên
                              </TableHead>
                              <TableHead className="font-medium">
                                Số điện thoại
                              </TableHead>
                              <TableHead className="font-medium">
                                Email
                              </TableHead>
                              <TableHead className="font-medium">
                                Chức vụ
                              </TableHead>
                              <TableHead className="font-medium">
                                Ghi chú
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {staff.map((staffMember) => (
                                <motion.tr
                                  key={staffMember._id}
                                  variants={itemVariants}
                                  className="cursor-pointer bg-muted/30"
                                  onClick={() => handleRowClick(staffMember)}
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                    transition: { duration: 0.2 },
                                  }}
                                  layout
                                >
                                  <TableCell className="font-medium">
                                    {staffMember.employeeCode}
                                  </TableCell>
                                  <TableCell>{staffMember.name}</TableCell>
                                  <TableCell>
                                    {staffMember.phoneNumber}
                                  </TableCell>
                                  <TableCell>{staffMember.email}</TableCell>
                                  <TableCell>
                                    {getRoleLabel(staffMember.role)}
                                  </TableCell>
                                  <TableCell className="max-w-[150px] truncate">
                                    {staffMember.note || ""}
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

      {selectedStaff && (
        <StaffDetailDialog
          staff={selectedStaff}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
}
