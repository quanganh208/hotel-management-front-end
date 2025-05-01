"use client";
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
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Search,
  Plus,
  X,
  FileDown,
  FileUp,
  Loader2,
  Package2,
  ArrowUpDown,
  BarChart3,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { ProductDetailDialog } from "@/components/hotels/inventory/product-detail-dialog";
import { CreateInventoryDialog } from "@/components/hotels/inventory/create-inventory-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInventoryStore } from "@/store";
import { InventoryItem } from "@/types/inventory";

export default function InventoryCategoriesPage() {
  const params = useParams();
  const hotelId = params?.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false); // Thêm state quản lý modal tạo hàng hóa
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Sử dụng store để lấy và quản lý dữ liệu inventory
  const {
    items: products,
    stats: inventoryStats,
    isLoading,
    error,
    fetchInventory,
  } = useInventoryStore();

  // Gọi API lấy dữ liệu khi component mount
  useEffect(() => {
    if (hotelId) {
      fetchInventory(hotelId);
    }
  }, [hotelId, fetchInventory]);

  // Lọc sản phẩm dựa trên từ khóa tìm kiếm
  const filteredProducts = products.filter((product) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      product.inventoryCode.toLowerCase().includes(searchTermLower) ||
      product.name.toLowerCase().includes(searchTermLower) ||
      (product.itemType &&
        product.itemType.toLowerCase().includes(searchTermLower))
    );
  });

  // Sắp xếp sản phẩm
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;

    let valueA, valueB;

    switch (sortField) {
      case "code":
        valueA = a.inventoryCode;
        valueB = b.inventoryCode;
        break;
      case "name":
        valueA = a.name;
        valueB = b.name;
        break;
      case "sellingPrice":
        valueA = a.sellingPrice;
        valueB = b.sellingPrice;
        break;
      case "costPrice":
        valueA = a.costPrice;
        valueB = b.costPrice;
        break;
      case "stock":
        valueA = a.stock;
        valueB = b.stock;
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

  // Xử lý khi click vào một hàng
  const handleRowClick = (product: InventoryItem) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  // Xử lý nhập file
  const handleImport = () => {
    toast.info("Tính năng nhập file sẽ được phát triển sau");
  };

  // Xử lý xuất file
  const handleExport = () => {
    toast.info("Tính năng xuất file sẽ được phát triển sau");
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

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
                      <BreadcrumbPage>Danh mục hàng hoá</BreadcrumbPage>
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
                  <Button onClick={() => fetchInventory(hotelId)}>
                    Thử lại
                  </Button>
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
                    <BreadcrumbPage>Danh mục hàng hoá</BreadcrumbPage>
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
                    <Package2 className="h-8 w-8 mr-2 text-primary" />
                    Danh mục hàng hoá
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Quản lý danh sách hàng hoá và tồn kho
                  </p>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button variant="outline" onClick={handleImport}>
                    <FileUp className="mr-2 h-4 w-4" /> Nhập file
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" /> Xuất file
                  </Button>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm hàng hoá
                  </Button>
                </div>
              </motion.div>

              {/* Thống kê nhanh */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <motion.div
                  custom={0}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-blue-900/20 dark:border-blue-800/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-blue-700 flex items-center dark:text-blue-300">
                        <Package2 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Tổng sản phẩm
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-3xl font-bold text-blue-700 dark:text-blue-200">
                        {inventoryStats.totalItems}
                      </div>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                        sản phẩm trong danh mục
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  custom={1}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:bg-gradient-to-br dark:from-green-950/40 dark:to-green-900/20 dark:border-green-800/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-green-700 flex items-center dark:text-green-300">
                        <BarChart3 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                        Tổng giá trị
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-3xl font-bold text-green-700 dark:text-green-200">
                        {formatCurrency(inventoryStats.totalValue)} đ
                      </div>
                      <p className="text-xs text-green-600/70 dark:text-green-400/70">
                        giá trị hàng tồn kho
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  custom={2}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 dark:bg-gradient-to-br dark:from-rose-950/40 dark:to-rose-900/20 dark:border-rose-800/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-rose-700 flex items-center dark:text-rose-300">
                        <Inbox className="h-5 w-5 mr-2 text-rose-600 dark:text-rose-400" />
                        Sắp hết hàng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-3xl font-bold text-rose-700 dark:text-rose-200">
                        {inventoryStats.lowStockItems}
                      </div>
                      <p className="text-xs text-rose-600/70 dark:text-rose-400/70">
                        sản phẩm cần nhập thêm
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  custom={3}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:bg-gradient-to-br dark:from-purple-950/40 dark:to-purple-900/20 dark:border-purple-800/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-purple-700 flex items-center dark:text-purple-300">
                        <Package2 className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                        Danh mục
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-3xl font-bold text-purple-700 dark:text-purple-200">
                        {inventoryStats.categoryCount}
                      </div>
                      <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                        phân loại hàng hóa
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

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
                    placeholder="Tìm kiếm hàng hoá..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
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
                            Mã hàng hoá
                            {getSortIcon("code")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-medium cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Tên hàng
                            {getSortIcon("name")}
                          </div>
                        </TableHead>
                        <TableHead className="font-medium">Loại</TableHead>
                        <TableHead
                          className="font-medium text-right cursor-pointer"
                          onClick={() => handleSort("sellingPrice")}
                        >
                          <div className="flex items-center justify-end">
                            Giá bán (VNĐ)
                            {getSortIcon("sellingPrice")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-medium text-right cursor-pointer"
                          onClick={() => handleSort("costPrice")}
                        >
                          <div className="flex items-center justify-end">
                            Giá vốn (VNĐ)
                            {getSortIcon("costPrice")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-medium text-center cursor-pointer"
                          onClick={() => handleSort("stock")}
                        >
                          <div className="flex items-center justify-center">
                            Tồn kho
                            {getSortIcon("stock")}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {sortedProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                              {searchTerm
                                ? "Không tìm thấy hàng hoá phù hợp"
                                : "Chưa có hàng hoá nào"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedProducts.map((product) => (
                            <motion.tr
                              key={product._id}
                              className="cursor-pointer hover:bg-muted/50 border-b transition-colors"
                              onClick={() => handleRowClick(product)}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              whileHover={{
                                backgroundColor: "rgba(0,0,0,0.03)",
                              }}
                            >
                              <TableCell className="font-medium">
                                {product.inventoryCode}
                              </TableCell>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getItemTypeLabel(product.itemType)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(product.sellingPrice)} đ
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(product.costPrice)} đ
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="flex items-center justify-center">
                                  {product.stock}
                                </span>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </motion.div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Hiển thị dialog chi tiết khi chọn sản phẩm */}
      {selectedProduct && (
        <ProductDetailDialog
          product={selectedProduct}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}

      {/* Dialog tạo hàng hoá mới */}
      <CreateInventoryDialog
        hotelId={hotelId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

// Helper function to map itemType to human-readable labels
function getItemTypeLabel(itemType: string): string {
  const typeMap: Record<string, string> = {
    beverage: "Đồ uống",
    food: "Thức ăn",
    amenity: "Tiện nghi",
    equipment: "Thiết bị",
    other: "Khác",
  };

  return typeMap[itemType] || itemType;
}
