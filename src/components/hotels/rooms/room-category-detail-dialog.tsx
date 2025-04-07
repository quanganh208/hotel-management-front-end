import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { formatNumberWithCommas } from "@/lib/utils";
import { RoomCategory, Room, RoomStatus } from "@/types/room";
import { useRoomCategoryStore } from "@/store/room-categories";
import { Edit, Trash, Save, X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
  const params = useParams();
  const hotelId = params.id as string;

  const [activeTab, setActiveTab] = useState("information");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    getRoomsByCategory,
    deleteRoomCategory,
    updateRoomCategory,
    error,
    success,
    setUpdateRoomCategoryForm,
    updateRoomCategoryForm,
    updateRoomCategoryFormErrors,
    validateUpdateRoomCategoryField,
    resetUpdateRoomCategoryForm,
    setUpdateFormFromCategory,
  } = useRoomCategoryStore();

  const rooms = getRoomsByCategory(category._id);

  // Khởi tạo form từ category khi component mount hoặc category thay đổi
  useEffect(() => {
    if (category) {
      setUpdateFormFromCategory(category);
    }
  }, [category, setUpdateFormFromCategory]);

  // Theo dõi và đóng dialog khi cập nhật thành công
  useEffect(() => {
    if (success && isEditMode) {
      setIsEditMode(false);
      setIsSaving(false);
      resetUpdateRoomCategoryForm();
      // Đóng dialog khi cập nhật thành công
      onOpenChange(false);
    }
  }, [success, isEditMode, resetUpdateRoomCategoryForm, onOpenChange]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      // Không cần gọi toast.error(error) ở đây vì đã được xử lý trong store
    }
  }, [error]);

  // Cập nhật URL preview khi hình ảnh thay đổi
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);

      // Cleanup function để giải phóng URL khi component unmount hoặc ảnh thay đổi
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreviewUrl(null);
    }
  }, [imageFile]);

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
        return "Không xác định";
    }
  };

  const handleUpdate = () => {
    setIsEditMode(true);
    setUpdateFormFromCategory(category);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast.error("Chỉ chấp nhận các định dạng: JPG, JPEG, PNG, WEBP");
        return;
      }

      // Kiểm tra kích thước file (10MB = 10 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Kích thước ảnh không được vượt quá 10MB");
        return;
      }

      setImageFile(file);
      setUpdateRoomCategoryForm("image", file);
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setImageFile(null);
    setUpdateRoomCategoryForm("image", null);
  };

  const handleSave = async () => {
    if (!category._id) return;

    setIsSaving(true);
    const result = await updateRoomCategory(category._id, hotelId);
    if (!result) {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setImageFile(null);
    resetUpdateRoomCategoryForm();
  };

  const handleDeleteClick = () => {
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!category._id) return;

    setIsDeleting(true);

    try {
      // Gọi API xóa và nhận kết quả
      const result = await deleteRoomCategory(category._id);

      // Nếu thành công, đóng dialog
      if (result) {
        setIsDeleteOpen(false);
        onOpenChange(false);
        // Không cần gọi fetchRoomCategories ở đây vì state đã được cập nhật trong store
      }
      // Không cần hiển thị toast.error(error) vì đã được xử lý trong store
    } catch (err) {
      console.error("Lỗi khi xóa hạng phòng:", err);
      // Không cần thêm toast.error ở đây vì đã được xử lý trong store
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // Xử lý các trường số
    if (["pricePerHour", "pricePerDay", "priceOvernight"].includes(name)) {
      parsedValue = parseInt(value) || 0;
    }

    // Cập nhật giá trị vào form
    setUpdateRoomCategoryForm(
      name as keyof typeof updateRoomCategoryForm,
      parsedValue
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={isEditMode ? undefined : onOpenChange}>
        <DialogContent
          className={`sm:max-w-[800px] h-[600px] overflow-hidden flex flex-col ${
            isEditMode ? "[&>button]:hidden" : ""
          }`}
        >
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
                    value={updateRoomCategoryForm.name}
                    onChange={handleChange}
                    onBlur={() => validateUpdateRoomCategoryField("name")}
                    className={cn(
                      updateRoomCategoryFormErrors.name && "border-destructive"
                    )}
                  />
                  {updateRoomCategoryFormErrors.name && (
                    <p className="text-sm text-destructive">
                      {updateRoomCategoryFormErrors.name}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả hạng phòng</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={updateRoomCategoryForm.description}
                    onChange={handleChange}
                    onBlur={() =>
                      validateUpdateRoomCategoryField("description")
                    }
                    className={cn(
                      updateRoomCategoryFormErrors.description &&
                        "border-destructive"
                    )}
                    rows={3}
                  />
                  {updateRoomCategoryFormErrors.description && (
                    <p className="text-sm text-destructive">
                      {updateRoomCategoryFormErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="pricePerHour">Giá theo giờ (VNĐ)</Label>
                    <Input
                      id="pricePerHour"
                      name="pricePerHour"
                      type="number"
                      value={updateRoomCategoryForm.pricePerHour}
                      onChange={handleChange}
                      onBlur={() =>
                        validateUpdateRoomCategoryField("pricePerHour")
                      }
                      className={cn(
                        updateRoomCategoryFormErrors.pricePerHour &&
                          "border-destructive"
                      )}
                    />
                    {updateRoomCategoryFormErrors.pricePerHour && (
                      <p className="text-sm text-destructive">
                        {updateRoomCategoryFormErrors.pricePerHour}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="pricePerDay">Giá cả ngày (VNĐ)</Label>
                    <Input
                      id="pricePerDay"
                      name="pricePerDay"
                      type="number"
                      value={updateRoomCategoryForm.pricePerDay}
                      onChange={handleChange}
                      onBlur={() =>
                        validateUpdateRoomCategoryField("pricePerDay")
                      }
                      className={cn(
                        updateRoomCategoryFormErrors.pricePerDay &&
                          "border-destructive"
                      )}
                    />
                    {updateRoomCategoryFormErrors.pricePerDay && (
                      <p className="text-sm text-destructive">
                        {updateRoomCategoryFormErrors.pricePerDay}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="priceOvernight">Giá qua đêm (VNĐ)</Label>
                    <Input
                      id="priceOvernight"
                      name="priceOvernight"
                      type="number"
                      value={updateRoomCategoryForm.priceOvernight}
                      onChange={handleChange}
                      onBlur={() =>
                        validateUpdateRoomCategoryField("priceOvernight")
                      }
                      className={cn(
                        updateRoomCategoryFormErrors.priceOvernight &&
                          "border-destructive"
                      )}
                    />
                    {updateRoomCategoryFormErrors.priceOvernight && (
                      <p className="text-sm text-destructive">
                        {updateRoomCategoryFormErrors.priceOvernight}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phần upload ảnh mới */}
                <div className="grid gap-2">
                  <Label>Ảnh hạng phòng</Label>
                  <div className="flex flex-col gap-4">
                    {imageFile && imagePreviewUrl ? (
                      <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border">
                        <Image
                          src={imagePreviewUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute right-2 top-2 flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={clearFileInput}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                          Ảnh thay thế
                        </p>
                      </div>
                    ) : category.image ? (
                      <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border">
                        <Image
                          src={category.image || ""}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute right-2 top-2 flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-white/80 hover:bg-white"
                            onClick={() => {
                              if (fileInputRef.current) {
                                fileInputRef.current.click();
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                          Ảnh hiện tại
                        </p>
                      </div>
                    ) : (
                      <label
                        htmlFor="image"
                        className="flex aspect-video w-full max-w-md mx-auto cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-accent/50"
                      >
                        <ImagePlus className="h-8 w-8" />
                        <span>Nhấp vào đây để chọn ảnh</span>
                        <span className="text-xs">
                          Chấp nhận: JPG, JPEG, PNG, WEBP
                        </span>
                        <span className="text-xs">Kích thước tối đa: 10MB</span>
                      </label>
                    )}
                    <input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    {updateRoomCategoryFormErrors.image && (
                      <p className="text-sm text-destructive">
                        {updateRoomCategoryFormErrors.image}
                      </p>
                    )}
                  </div>
                </div>
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
                          {category.rooms?.length || 0} phòng
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hàng 2: Bảng giá chiếm toàn bộ chiều rộng */}
                  <div className="mt-2">
                    <h3 className="text-lg font-medium mb-3">Bảng giá</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border-l-4 border-l-blue-500 shadow-sm gap-3 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium">Giá giờ</p>
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
                        </div>
                        <p className="text-sm font-semibold text-blue-600">
                          {category.pricePerHour
                            ? formatNumberWithCommas(category.pricePerHour)
                            : "N/A"}{" "}
                          <span className="text-xs font-normal">VNĐ</span>
                        </p>
                      </div>

                      <div className="border-l-4 border-l-green-500 shadow-sm gap-3 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium">Giá ngày</p>
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
                        </div>
                        <p className="text-sm font-semibold text-green-600">
                          {category.pricePerDay
                            ? formatNumberWithCommas(category.pricePerDay)
                            : "N/A"}{" "}
                          <span className="text-xs font-normal">VNĐ</span>
                        </p>
                      </div>

                      <div className="border-l-4 border-l-purple-500 shadow-sm gap-3 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium">Giá đêm</p>
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
                        </div>
                        <p className="text-sm font-semibold text-purple-600">
                          {category.priceOvernight
                            ? formatNumberWithCommas(category.priceOvernight)
                            : "N/A"}{" "}
                          <span className="text-xs font-normal">VNĐ</span>
                        </p>
                      </div>
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
                        <TableHead className="font-medium">
                          Trạng thái
                        </TableHead>
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
                              Phòng {room.roomNumber}
                            </TableCell>
                            <TableCell>Tầng {room.floor}</TableCell>
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

          <DialogFooter className="mt-auto pt-4 border-t">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="mr-2"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" /> Hủy
                </Button>
                <Button type="button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Lưu
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="mr-2"
                >
                  <Trash className="h-4 w-4 mr-2" /> Xóa
                </Button>
                <Button type="button" onClick={handleUpdate}>
                  <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa hạng phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hạng phòng &#34;{category.name}&#34;?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white font-medium"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xóa...
                </>
              ) : (
                "Xác nhận xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
