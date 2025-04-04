import { useState } from "react";
import Image from "next/image";
import { formatNumberWithCommas } from "@/lib/utils";
import { RoomCategory, Room } from "@/types/room";
import { useRoomCategoryStore } from "@/store/room-categories";
import { Edit, Trash, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface RoomCategoryDetailProps {
  category: RoomCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomCategoryDetailDialog({
  category,
  open,
  onOpenChange,
}: RoomCategoryDetailProps) {
  const [activeTab, setActiveTab] = useState("information");
  const [isEditMode, setIsEditMode] = useState(false);
  const { getRoomsByCategory } = useRoomCategoryStore();
  const rooms = getRoomsByCategory(category._id);

  // State cho form cập nhật
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description,
    roomCount: category.roomCount,
    hourlyPrice: category.hourlyPrice,
    dailyPrice: category.dailyPrice,
    overnightPrice: category.overnightPrice,
    image: category.image,
  });

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "Trống";
      case "occupied":
        return "Đang sử dụng";
      case "maintenance":
        return "Bảo trì";
      default:
        return "Không xác định";
    }
  };

  const handleUpdate = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    // Chức năng lưu sẽ thực hiện sau
    console.log("Lưu cập nhật hạng phòng:", formData);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    // Reset lại form data
    setFormData({
      name: category.name,
      description: category.description,
      roomCount: category.roomCount,
      hourlyPrice: category.hourlyPrice,
      dailyPrice: category.dailyPrice,
      overnightPrice: category.overnightPrice,
      image: category.image,
    });
    setIsEditMode(false);
  };

  const handleDelete = () => {
    // Chức năng xóa sẽ thực hiện sau
    console.log("Xóa hạng phòng:", category._id);
    onOpenChange(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // Xử lý các trường số
    if (
      ["roomCount", "hourlyPrice", "dailyPrice", "overnightPrice"].includes(
        name
      )
    ) {
      parsedValue = parseInt(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={isEditMode ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[650px] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditMode ? "Cập nhật hạng phòng" : category.name}
          </DialogTitle>
        </DialogHeader>

        {isEditMode ? (
          // Chế độ chỉnh sửa
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên hạng phòng</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả hạng phòng</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="roomCount">Số lượng phòng</Label>
                  <Input
                    id="roomCount"
                    name="roomCount"
                    type="number"
                    value={formData.roomCount}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="hourlyPrice">Giá theo giờ (VNĐ)</Label>
                  <Input
                    id="hourlyPrice"
                    name="hourlyPrice"
                    type="number"
                    value={formData.hourlyPrice}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dailyPrice">Giá cả ngày (VNĐ)</Label>
                  <Input
                    id="dailyPrice"
                    name="dailyPrice"
                    type="number"
                    value={formData.dailyPrice}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="overnightPrice">Giá qua đêm (VNĐ)</Label>
                  <Input
                    id="overnightPrice"
                    name="overnightPrice"
                    type="number"
                    value={formData.overnightPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phần ảnh - có thể mở rộng sau để hỗ trợ thay đổi ảnh */}
              {formData.image && (
                <div>
                  <Label>Ảnh hạng phòng</Label>
                  <div className="mt-2 relative aspect-video w-full max-w-md overflow-hidden rounded-lg">
                    <Image
                      src={formData.image}
                      alt={formData.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Chế độ xem
          <Tabs
            defaultValue="information"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="information">Thông tin</TabsTrigger>
              <TabsTrigger value="rooms">Danh sách phòng</TabsTrigger>
            </TabsList>
            <TabsContent
              value="information"
              className="p-4 flex-1 overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                {/* Hàng 1: Ảnh bên trái, thông tin bên phải */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.image ? (
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-video bg-muted rounded-lg">
                      <p className="text-muted-foreground">Không có ảnh</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Mô tả</h3>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Số lượng phòng</h3>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {category.roomCount} phòng
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hàng 2: Bảng giá chiếm toàn bộ chiều rộng */}
                <div className="mt-2">
                  <h3 className="text-lg font-medium mb-3">Bảng giá</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm gap-3">
                      <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Giá giờ</CardTitle>
                        <div className="rounded-full bg-blue-100 p-1 text-blue-500">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm font-semibold text-blue-600">
                          {formatNumberWithCommas(category.hourlyPrice)}{" "}
                          <span className="text-xs font-normal">VNĐ</span>
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm gap-3">
                      <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Giá ngày</CardTitle>
                        <div className="rounded-full bg-green-100 p-1 text-green-500">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
                          </svg>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm font-semibold text-green-600">
                          {formatNumberWithCommas(category.dailyPrice)}{" "}
                          <span className="text-xs font-normal">VNĐ</span>
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 shadow-sm gap-3">
                      <CardHeader className="p-3 pb-1.5 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Giá đêm</CardTitle>
                        <div className="rounded-full bg-purple-100 p-1 text-purple-500">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                          </svg>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm font-semibold text-purple-600">
                          {formatNumberWithCommas(category.overnightPrice)}{" "}
                          <span className="text-xs font-normal">VNĐ</span>
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="rooms" className="p-4 flex-1 overflow-y-auto">
              <div className="rounded-md border h-full overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-medium">Tên phòng</TableHead>
                      <TableHead className="font-medium">Khu vực</TableHead>
                      <TableHead className="font-medium">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                          Không có phòng nào thuộc hạng phòng này.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rooms.map((room) => (
                        <TableRow key={room._id}>
                          <TableCell className="font-medium">
                            {room.name}
                          </TableCell>
                          <TableCell>{room.area}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(
                                room.status
                              )} text-white`}
                            >
                              {getStatusText(room.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="border-t pt-4 flex justify-end">
          {isEditMode ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="gap-1.5"
              >
                <X className="h-4 w-4" /> Hủy
              </Button>
              <Button onClick={handleSave} className="gap-1.5">
                <Save className="h-4 w-4" /> Lưu thay đổi
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4" /> Xóa
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={handleUpdate}
              >
                <Edit className="h-4 w-4" /> Cập nhật
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
