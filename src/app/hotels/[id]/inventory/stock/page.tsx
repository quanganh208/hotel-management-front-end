"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  FileDown,
  Loader2,
  FileText,
  ArrowUpDown,
  Calendar,
  CalendarCheck,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/header";
import { useInventoryCheckStore } from "@/store/inventory-check";
import { InventoryCheck, InventoryCheckStatus } from "@/types/inventory";
import { CreateInventoryCheckDialog } from "@/components/hotels/inventory/create-inventory-check-dialog";
import { InventoryCheckDetailDialog } from "@/components/hotels/inventory/inventory-check-detail-dialog";

export default function InventoryStockPage() {
  const params = useParams();
  const hotelId = params?.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Sử dụng store để lấy và quản lý dữ liệu kiểm kho
  const { inventoryChecks, isLoading, error, fetchInventoryChecks } =
    useInventoryCheckStore();

  // Gọi API lấy dữ liệu khi component mount
  useEffect(() => {
    if (hotelId) {
      fetchInventoryChecks(hotelId);
    }
  }, [hotelId, fetchInventoryChecks]);

  // Load lại dữ liệu khi cần
  const loadData = useCallback(async () => {
    if (!hotelId) return;
    await fetchInventoryChecks(hotelId);
  }, [fetchInventoryChecks, hotelId]);

  // Lọc phiếu kiểm kho dựa trên từ khóa tìm kiếm
  const filteredChecks =
    inventoryChecks?.filter((check) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        check.checkCode.toLowerCase().includes(searchTermLower) ||
        (check.note && check.note.toLowerCase().includes(searchTermLower))
      );
    }) || [];

  // Sắp xếp phiếu kiểm kho
  const sortedChecks = [...filteredChecks].sort((a, b) => {
    if (!sortField) {
      // Mặc định sắp xếp theo ngày tạo mới nhất
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    let valueA, valueB;

    switch (sortField) {
      case "code":
        valueA = a.checkCode;
        valueB = b.checkCode;
        break;
      case "createdAt":
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case "balanceDate":
        valueA = a.balanceDate ? new Date(a.balanceDate).getTime() : 0;
        valueB = b.balanceDate ? new Date(b.balanceDate).getTime() : 0;
        break;
      case "totalDifference":
        valueA = a.totalDifference;
        valueB = b.totalDifference;
        break;
      case "totalIncrease":
        valueA = a.totalIncrease;
        valueB = b.totalIncrease;
        break;
      case "totalDecrease":
        valueA = a.totalDecrease;
        valueB = b.totalDecrease;
        break;
      case "status":
        valueA = a.status;
        valueB = b.status;
        break;
      default:
        return 0;
    }

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    } else {
      return sortDirection === "asc"
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    }
  });

  // Xử lý sắp xếp
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Xử lý khi click vào một phiếu kiểm kho
  const handleRowClick = (check: InventoryCheck) => {
    setSelectedCheck(check._id);
    setDetailOpen(true);
  };

  // Xử lý xuất file
  const handleExport = () => {
    toast.info("Tính năng xuất file sẽ được phát triển sau");
  };

  // Helper function để format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  // Helper để lấy badge trạng thái
  const getStatusBadge = (status: InventoryCheckStatus) => {
    switch (status) {
      case InventoryCheckStatus.DRAFT:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900"
          >
            Phiếu tạm
          </Badge>
        );
      case InventoryCheckStatus.BALANCED:
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900"
          >
            Đã cân bằng
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
    visible: { opacity: 1, y: 0 },
  };

  // Lấy icon sắp xếp
  const getSortIcon = (field: string) => {
    if (sortField !== field)
      return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground/50" />;
    return sortDirection === "asc" ? (
      <ArrowUpDown className="ml-1 h-4 w-4 text-primary" />
    ) : (
      <ArrowUpDown className="ml-1 h-4 w-4 rotate-180 text-primary" />
    );
  };

  // Hiển thị thông báo lỗi nếu có
  if (error) {
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
                      <BreadcrumbPage>Hàng hoá</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Kiểm kho</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="min-h-[100vh] flex-1 rounded-xl bg-background md:min-h-min p-6 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-600 mb-4">
                    Lỗi khi tải dữ liệu
                  </h2>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={loadData}>Thử lại</Button>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

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
                    <BreadcrumbPage>Hàng hoá</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Kiểm kho</BreadcrumbPage>
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
                    <ClipboardCheck className="h-8 w-8 mr-2 text-primary" />
                    Kiểm kho
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Quản lý phiếu kiểm kho và cân bằng kho hàng
                  </p>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" /> Xuất file
                  </Button>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Tạo phiếu kiểm kho
                  </Button>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col md:flex-row justify-between mb-6 gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm phiếu kiểm kho..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </motion.div>

              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {sortedChecks.length === 0 ? (
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
                    >
                      <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <p className="text-lg">Chưa có phiếu kiểm kho nào</p>
                      <p className="text-sm mt-2">
                        Tạo phiếu kiểm kho đầu tiên để bắt đầu quản lý tồn kho
                      </p>
                      <Button
                        className="mt-6"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Tạo phiếu kiểm kho
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="rounded-md border overflow-hidden"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted">
                            <TableHead
                              className="font-medium cursor-pointer"
                              onClick={() => handleSort("code")}
                            >
                              <div className="flex items-center">
                                Mã phiếu
                                {getSortIcon("code")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="font-medium cursor-pointer"
                              onClick={() => handleSort("createdAt")}
                            >
                              <div className="flex items-center">
                                Thời gian tạo
                                {getSortIcon("createdAt")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="font-medium cursor-pointer"
                              onClick={() => handleSort("balanceDate")}
                            >
                              <div className="flex items-center">
                                Ngày cân bằng
                                {getSortIcon("balanceDate")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="font-medium text-right cursor-pointer"
                              onClick={() => handleSort("totalDifference")}
                            >
                              <div className="flex items-center justify-end">
                                Tổng chênh lệch
                                {getSortIcon("totalDifference")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="font-medium text-right cursor-pointer"
                              onClick={() => handleSort("totalIncrease")}
                            >
                              <div className="flex items-center justify-end">
                                SL lệch tăng
                                {getSortIcon("totalIncrease")}
                              </div>
                            </TableHead>
                            <TableHead
                              className="font-medium text-right cursor-pointer"
                              onClick={() => handleSort("totalDecrease")}
                            >
                              <div className="flex items-center justify-end">
                                SL lệch giảm
                                {getSortIcon("totalDecrease")}
                              </div>
                            </TableHead>
                            <TableHead>Ghi chú</TableHead>
                            <TableHead
                              className="font-medium cursor-pointer text-center"
                              onClick={() => handleSort("status")}
                            >
                              <div className="flex items-center justify-center">
                                Trạng thái
                                {getSortIcon("status")}
                              </div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedChecks.map((check) => (
                            <motion.tr
                              key={check._id}
                              className="cursor-pointer hover:bg-muted/50 border-b transition-colors"
                              onClick={() => handleRowClick(check)}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{
                                backgroundColor: "rgba(0,0,0,0.03)",
                              }}
                            >
                              <TableCell className="font-medium">
                                {check.checkCode}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  {formatDate(check.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {check.balanceDate ? (
                                  <div className="flex items-center gap-1.5">
                                    <CalendarCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                    {formatDate(check.balanceDate)}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Chưa cân bằng
                                  </span>
                                )}
                              </TableCell>
                              <TableCell
                                className={`text-right font-medium ${
                                  check.totalDifference > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : check.totalDifference < 0
                                      ? "text-red-600 dark:text-red-400"
                                      : ""
                                }`}
                              >
                                {check.totalDifference > 0 ? "+" : ""}
                                {check.totalDifference}
                              </TableCell>
                              <TableCell className="text-right text-green-600 dark:text-green-400">
                                {check.totalIncrease > 0
                                  ? `+${check.totalIncrease}`
                                  : "0"}
                              </TableCell>
                              <TableCell className="text-right text-red-600 dark:text-red-400">
                                {check.totalDecrease < 0
                                  ? check.totalDecrease
                                  : "0"}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {check.note || (
                                  <span className="text-muted-foreground italic">
                                    Không có ghi chú
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {getStatusBadge(
                                  check.status as InventoryCheckStatus
                                )}
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Dialog tạo phiếu kiểm kho mới */}
      <CreateInventoryCheckDialog
        hotelId={hotelId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Dialog chi tiết phiếu kiểm kho */}
      {selectedCheck && (
        <InventoryCheckDetailDialog
          inventoryCheckId={selectedCheck}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
}
