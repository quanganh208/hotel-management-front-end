"use client";

import { AppSidebar } from "@/components/hotels/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Header from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  PieChart,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { useParams } from "next/navigation";
import {
  DollarSignIcon,
  PercentIcon,
  BarChart3Icon,
  UserIcon,
  PieChartIcon,
  ShoppingCartIcon,
  ClipboardCheckIcon,
} from "lucide-react";
import { Room } from "@/types/room";
import { RoomStatus } from "@/types/room";

interface RevenueData {
  totalRevenue: number;
  revenueByPaymentMethod: Record<string, number>;
  revenueByDate: Record<string, number>;
  invoiceCountByStatus: Record<string, number>;
  totalInvoices: number;
}

interface RoomData {
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  roomsByStatus: Record<string, number>;
  roomsByType: Record<string, number>;
  recentStatusChanges: StatusChange[];
}

interface StatusChange {
  _id: string;
  roomId: string;
  status: string;
  previousStatus: string;
  changedBy: string;
  changedAt: string;
  note: string;
  room?: {
    _id: string;
    roomNumber: string;
    floor: string;
  };
}

interface InventoryItem {
  _id: string;
  inventoryCode: string;
  name: string;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  itemType: string;
}

interface InventoryData {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categoryCount: number;
  items: InventoryItem[];
}

interface Booking {
  _id: string;
  roomId: {
    _id: string;
    roomNumber: string;
    floor: string;
  };
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  phoneNumber: string;
  guestCount: number;
  note: string;
  status: string;
  createdBy: {
    _id: string;
    email: string;
    name: string;
  };
}

interface RecentActivities {
  bookings: Booking[];
}

interface DashboardData {
  revenue: RevenueData;
  rooms: RoomData;
  inventory: InventoryData;
  recentActivities: RecentActivities;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface RevenueChartItem {
  date: string;
  revenue: number;
}

// StatCard component để hiển thị các thống kê với icon
const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 transition-colors duration-300 hover:bg-primary/20">
        <Icon className="h-full w-full text-primary" />
      </div>
    </CardHeader>
    <CardContent className="p-6 pt-0">
      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        {value}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {trend && (
        <div
          className={`flex items-center text-xs mt-2 ${
            trend === "up"
              ? "text-emerald-500 dark:text-emerald-400"
              : trend === "down"
                ? "text-rose-500 dark:text-rose-400"
                : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {trend === "up" && <span className="mr-1">↑</span>}
          {trend === "down" && <span className="mr-1">↓</span>}
          {trendValue}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function HotelOverviewPage() {
  const params = useParams();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const hotelId = params.id as string;

        const url = `/dashboard/overview/${hotelId}`;

        const { data } = await axiosInstance.get<DashboardData>(url);
        setDashboardData(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [params.id]);

  const formatRevenueData = (
    revenueByDate: Record<string, number> | undefined,
  ): RevenueChartItem[] => {
    if (!revenueByDate) return [];

    return Object.entries(revenueByDate).map(([date, value]) => ({
      date: new Date(date).toLocaleDateString("vi-VN"),
      revenue: value,
    }));
  };

  const formatPaymentMethodData = (
    revenueByPaymentMethod: Record<string, number> | undefined,
  ): ChartDataItem[] => {
    if (!revenueByPaymentMethod) return [];

    return Object.entries(revenueByPaymentMethod).map(([method, value]) => ({
      name:
        method === "CASH"
          ? "Tiền mặt"
          : method === "BANK_TRANSFER"
            ? "Chuyển khoản"
            : method === "TRANSFER"
              ? "Chuyển khoản"
              : "Khác",
      value,
    }));
  };

  const formatRoomStatusData = (
    roomsByStatus: Record<string, number> | undefined,
  ): ChartDataItem[] => {
    if (!roomsByStatus) return [];

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

    return Object.entries(roomsByStatus)
      .filter(([, count]) => count > 0) // Chỉ lấy trạng thái có phòng
      .map(([status, count]) => ({
        name: getStatusText(status as Room["status"]),
        value: count as number,
      }));
  };

  const COLORS = [
    "#3B82F6", // blue-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#EF4444", // red-500
    "#8B5CF6", // violet-500
    "#EC4899", // pink-500
  ];

  const renderRoomStatus = (status: string) => {
    const statusColors: Record<string, string> = {
      VACANT_CLEAN:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      VACANT_DIRTY:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      OCCUPIED:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
      OUT_OF_SERVICE:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      RESERVED:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      MAINTENANCE:
        "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
      available:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      checked_in:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
      checked_out:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      booked:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };

    const statusNames: Record<string, string> = {
      VACANT_CLEAN: "Trống (đã dọn)",
      VACANT_DIRTY: "Trống (chưa dọn)",
      OCCUPIED: "Đang sử dụng",
      OUT_OF_SERVICE: "Ngừng phục vụ",
      RESERVED: "Đã đặt",
      MAINTENANCE: "Bảo trì",
      available: "Trống",
      checked_in: "Đã nhận phòng",
      checked_out: "Đã trả phòng",
      booked: "Đã đặt",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {statusNames[status] || status}
      </Badge>
    );
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
                    <BreadcrumbPage>Tổng quan</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6 pt-2">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-lg font-medium text-muted-foreground">
                    Đang tải dữ liệu...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Section: Thống kê doanh thu */}
                <section className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Thống kê doanh thu
                    </h2>
                    <div className="text-sm text-muted-foreground">
                      Cập nhật gần nhất: {new Date().toLocaleString("vi-VN")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      title="Tổng doanh thu"
                      value={`${formatCurrency(dashboardData?.revenue?.totalRevenue || 0)} VND`}
                      description={`${dashboardData?.revenue?.totalInvoices || 0} hóa đơn`}
                      icon={DollarSignIcon}
                    />

                    <StatCard
                      title="Tỷ lệ lấp đầy"
                      value={`${dashboardData?.rooms?.occupancyRate || 0}%`}
                      description={`${dashboardData?.rooms?.occupiedRooms || 0}/${dashboardData?.rooms?.totalRooms || 0} phòng`}
                      icon={PercentIcon}
                    />

                    <StatCard
                      title="Tổng giá trị kho"
                      value={`${formatCurrency(dashboardData?.inventory?.totalValue || 0)} VND`}
                      description={`${dashboardData?.inventory?.totalItems || 0} mặt hàng`}
                      icon={ShoppingCartIcon}
                    />

                    <StatCard
                      title="Đặt phòng gần đây"
                      value={
                        dashboardData?.recentActivities?.bookings?.length || 0
                      }
                      icon={ClipboardCheckIcon}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3Icon className="h-5 w-5 text-primary" />
                            Doanh thu theo ngày
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="h-[300px] pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={formatRevenueData(
                              dashboardData?.revenue?.revenueByDate,
                            )}
                            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                          >
                            <defs>
                              <linearGradient
                                id="colorRevenue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#3B82F6"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#3B82F6"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                              className="stroke-gray-200 dark:stroke-gray-700"
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 12 }}
                              tickMargin={10}
                              className="text-gray-600 dark:text-gray-400"
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) =>
                                `${value.toLocaleString("vi-VN")}`
                              }
                              className="text-gray-600 dark:text-gray-400"
                            />
                            <Tooltip
                              formatter={(value: number) => [
                                `${value.toLocaleString("vi-VN")} VND`,
                                "Doanh thu",
                              ]}
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "0.5rem",
                                border: "1px solid #e2e8f0",
                                padding: "0.5rem",
                                fontSize: "0.875rem",
                                color: "#1f2937",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#3B82F6"
                              fillOpacity={1}
                              fill="url(#colorRevenue)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                            Phương thức thanh toán
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="h-[300px] pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <Pie
                              data={formatPaymentMethodData(
                                dashboardData?.revenue?.revenueByPaymentMethod,
                              )}
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              innerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              paddingAngle={2}
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {formatPaymentMethodData(
                                dashboardData?.revenue?.revenueByPaymentMethod,
                              ).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                `${value.toLocaleString("vi-VN")} VND`,
                                "Giá trị",
                              ]}
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "0.5rem",
                                border: "1px solid #e2e8f0",
                                padding: "0.5rem",
                                fontSize: "0.875rem",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Section: Quản lý phòng */}
                <section className="space-y-6 mt-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Quản lý phòng
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="overflow-hidden md:col-span-1">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                          Trạng thái phòng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[250px] pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <Pie
                              data={formatRoomStatusData(
                                dashboardData?.rooms?.roomsByStatus,
                              )}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              paddingAngle={2}
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {formatRoomStatusData(
                                dashboardData?.rooms?.roomsByStatus,
                              ).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardCheckIcon className="h-5 w-5 text-muted-foreground" />
                          Lịch sử trạng thái phòng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-[250px] overflow-auto pt-0">
                        {!dashboardData?.rooms?.recentStatusChanges?.length ? (
                          <div className="flex items-center justify-center h-full py-6">
                            <p className="text-sm text-muted-foreground">
                              Không có thay đổi trạng thái gần đây
                            </p>
                          </div>
                        ) : (
                          <Table className="w-full">
                            <TableHeader>
                              <TableRow className="hover:bg-muted/50 dark:hover:bg-gray-800/50">
                                <TableHead className="text-gray-600 dark:text-gray-400">
                                  Phòng
                                </TableHead>
                                <TableHead className="text-gray-600 dark:text-gray-400">
                                  Trạng thái
                                </TableHead>
                                <TableHead className="text-gray-600 dark:text-gray-400">
                                  Thời gian
                                </TableHead>
                                <TableHead className="text-gray-600 dark:text-gray-400">
                                  Ghi chú
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dashboardData?.rooms?.recentStatusChanges
                                ?.slice(0, 5)
                                .map((change) => (
                                  <TableRow
                                    key={change._id}
                                    className="hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                                  >
                                    <TableCell className="font-medium">
                                      {change.room?.roomNumber || "-"}
                                    </TableCell>
                                    <TableCell>
                                      {renderRoomStatus(change.status)}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      {new Date(
                                        change.changedAt,
                                      ).toLocaleString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "2-digit",
                                        month: "2-digit",
                                      })}
                                    </TableCell>
                                    <TableCell className="truncate max-w-[200px]">
                                      {change.note || "-"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Section: Quản lý tồn kho */}
                <section className="space-y-6 mt-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Quản lý tồn kho
                  </h2>

                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCartIcon className="h-5 w-5 text-muted-foreground" />
                        Danh sách mặt hàng
                      </CardTitle>
                      <CardDescription>
                        Tổng cộng {dashboardData?.inventory?.totalItems || 0}{" "}
                        mặt hàng với giá trị{" "}
                        {formatCurrency(
                          dashboardData?.inventory?.totalValue || 0,
                        )}{" "}
                        VND
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-24">Mã</TableHead>
                              <TableHead>Tên</TableHead>
                              <TableHead>Loại</TableHead>
                              <TableHead className="text-right">
                                Giá bán
                              </TableHead>
                              <TableHead className="text-right">
                                Giá nhập
                              </TableHead>
                              <TableHead className="text-right">
                                Tồn kho
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dashboardData?.inventory?.items?.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="h-24 text-center"
                                >
                                  Không có mặt hàng nào
                                </TableCell>
                              </TableRow>
                            ) : (
                              dashboardData?.inventory?.items?.map((item) => (
                                <TableRow
                                  key={item._id}
                                  className="hover:bg-muted/30"
                                >
                                  <TableCell className="font-medium">
                                    {item.inventoryCode}
                                  </TableCell>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className="capitalize"
                                    >
                                      {item.itemType === "beverage"
                                        ? "Đồ uống"
                                        : item.itemType === "food"
                                          ? "Thực phẩm"
                                          : item.itemType}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(item.sellingPrice)} đ
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(item.costPrice)} đ
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.stock} {item.unit}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Section: Hoạt động gần đây */}
                <section className="space-y-6 mt-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Hoạt động gần đây
                  </h2>

                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        Đặt phòng gần đây
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên khách hàng</TableHead>
                              <TableHead>Phòng</TableHead>
                              <TableHead>Nhận phòng</TableHead>
                              <TableHead>Trả phòng</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dashboardData?.recentActivities?.bookings
                              ?.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="h-24 text-center"
                                >
                                  Không có đặt phòng gần đây
                                </TableCell>
                              </TableRow>
                            ) : (
                              dashboardData?.recentActivities?.bookings?.map(
                                (booking) => (
                                  <TableRow
                                    key={booking._id}
                                    className="hover:bg-muted/30"
                                  >
                                    <TableCell className="font-medium">
                                      {booking.guestName}
                                    </TableCell>
                                    <TableCell>
                                      {booking.roomId?.roomNumber}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      {new Date(
                                        booking.checkInDate,
                                      ).toLocaleString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "2-digit",
                                        month: "2-digit",
                                      })}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      {new Date(
                                        booking.checkOutDate,
                                      ).toLocaleString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "2-digit",
                                        month: "2-digit",
                                      })}
                                    </TableCell>
                                    <TableCell>
                                      {renderRoomStatus(booking.status)}
                                    </TableCell>
                                  </TableRow>
                                ),
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
