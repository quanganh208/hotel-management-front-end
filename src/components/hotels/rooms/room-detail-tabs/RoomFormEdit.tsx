import React, { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X, Edit, Save } from "lucide-react";
import {
  RoomWithType,
  RoomStatus,
  UpdateRoomForm,
  RoomFormErrors,
  RoomCategory,
} from "@/types/room";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RoomFormEditProps {
  room: RoomWithType;
  imagePreviewUrl: string | null;
  updateRoomForm: UpdateRoomForm;
  updateRoomFormErrors: RoomFormErrors;
  filteredCategories: RoomCategory[];
  isFetchingCategories: boolean;
  isLoading: boolean;
  setUpdateRoomForm: (
    field: keyof UpdateRoomForm,
    value: string | File | null
  ) => void;
  validateUpdateRoomField: (field: keyof UpdateRoomForm) => boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const RoomFormEdit: React.FC<RoomFormEditProps> = ({
  room,
  imagePreviewUrl,
  updateRoomForm,
  updateRoomFormErrors,
  filteredCategories,
  isFetchingCategories,
  isLoading,
  setUpdateRoomForm,
  validateUpdateRoomField,
  setIsEditing,
  handleSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        setUpdateRoomForm("image", null);
        setUpdateRoomForm(
          "imageError",
          "Định dạng file không được hỗ trợ. Vui lòng chọn file JPG, JPEG, PNG hoặc WEBP."
        );
        toast.error(
          "Định dạng file không được hỗ trợ. Vui lòng chọn file JPG, JPEG, PNG hoặc WEBP."
        );
        return;
      }

      // Kiểm tra kích thước file (10MB = 10 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        setUpdateRoomForm("image", null);
        setUpdateRoomForm(
          "imageError",
          "Kích thước file không được vượt quá 10MB."
        );
        toast.error("Kích thước file không được vượt quá 10MB.");
        return;
      }

      setUpdateRoomForm("image", file);
      setUpdateRoomForm("imageError", "");
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUpdateRoomForm("image", null);
    setUpdateRoomForm("imageError", "");
  };

  return (
    <div className="flex flex-col h-full">
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-4 pb-16"
      >
        <div className="grid gap-6">
          {/* Số phòng và Tầng cùng một hàng */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2 h-[85px]">
              <Label htmlFor="roomNumber">Số phòng</Label>
              <Input
                id="roomNumber"
                value={updateRoomForm.roomNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUpdateRoomForm("roomNumber", e.target.value)
                }
                onBlur={() => validateUpdateRoomField("roomNumber")}
                className={cn(
                  "h-9",
                  updateRoomFormErrors.roomNumber && "border-destructive"
                )}
                disabled={isLoading}
              />
              <div className="h-5">
                {updateRoomFormErrors.roomNumber && (
                  <p className="text-sm text-destructive">
                    {updateRoomFormErrors.roomNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2 h-[85px]">
              <Label htmlFor="floor">Tầng</Label>
              <Input
                id="floor"
                value={updateRoomForm.floor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUpdateRoomForm("floor", e.target.value)
                }
                onBlur={() => validateUpdateRoomField("floor")}
                className={cn(
                  "h-9",
                  updateRoomFormErrors.floor && "border-destructive"
                )}
                disabled={isLoading}
              />
              <div className="h-5">
                {updateRoomFormErrors.floor && (
                  <p className="text-sm text-destructive">
                    {updateRoomFormErrors.floor}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Trạng thái và Hạng phòng */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={updateRoomForm.status}
                onValueChange={(value: RoomStatus) =>
                  setUpdateRoomForm("status", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Trạng thái</SelectLabel>
                    <SelectItem value={RoomStatus.AVAILABLE}>Trống</SelectItem>
                    <SelectItem value={RoomStatus.OCCUPIED}>
                      Đang sử dụng
                    </SelectItem>
                    <SelectItem value={RoomStatus.BOOKED}>
                      Đã đặt trước
                    </SelectItem>
                    <SelectItem value={RoomStatus.CHECKED_IN}>
                      Đã nhận phòng
                    </SelectItem>
                    <SelectItem value={RoomStatus.CHECKED_OUT}>
                      Đã trả phòng
                    </SelectItem>
                    <SelectItem value={RoomStatus.CLEANING}>
                      Đang dọn dẹp
                    </SelectItem>
                    <SelectItem value={RoomStatus.MAINTENANCE}>
                      Bảo trì
                    </SelectItem>
                    <SelectItem value={RoomStatus.OUT_OF_SERVICE}>
                      Ngừng sử dụng
                    </SelectItem>
                    <SelectItem value={RoomStatus.RESERVED}>
                      Đã giữ chỗ
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="roomTypeId">Hạng phòng</Label>
              <Select
                value={updateRoomForm.roomTypeId}
                onValueChange={(value: string) =>
                  setUpdateRoomForm("roomTypeId", value)
                }
                disabled={isLoading || isFetchingCategories}
                onOpenChange={() => {
                  if (!updateRoomForm.roomTypeId) {
                    validateUpdateRoomField("roomTypeId");
                  }
                }}
              >
                <SelectTrigger
                  id="roomTypeId"
                  className={cn(
                    updateRoomFormErrors.roomTypeId && "border-destructive"
                  )}
                >
                  <SelectValue placeholder="Chọn hạng phòng" />
                </SelectTrigger>
                <SelectContent>
                  {isFetchingCategories ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Chưa có hạng phòng nào
                    </div>
                  ) : (
                    <SelectGroup>
                      <SelectLabel>Hạng phòng</SelectLabel>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              {updateRoomFormErrors.roomTypeId && (
                <p className="text-sm text-destructive">
                  {updateRoomFormErrors.roomTypeId}
                </p>
              )}
            </div>
          </div>

          {/* Ghi chú */}
          <div className="grid gap-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={updateRoomForm.note || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setUpdateRoomForm("note", e.target.value)
              }
              className="h-[150px]"
              disabled={isLoading}
              placeholder="Nhập ghi chú về phòng (không bắt buộc)"
            />
          </div>

          {/* Phần upload ảnh */}
          <div className="grid gap-2">
            <Label>Hình ảnh phòng</Label>
            <div className="flex flex-col gap-4">
              {updateRoomForm.image && imagePreviewUrl ? (
                // Trường hợp 1: Khi vừa chọn ảnh mới
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
              ) : room.image ? (
                // Trường hợp 2: Khi có ảnh hiện tại của phòng
                <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border">
                  <Image
                    src={room.image}
                    alt={`Phòng ${room.roomNumber}`}
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
                // Trường hợp 3: Khi không có ảnh
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
                disabled={isLoading}
                ref={fileInputRef}
              />
            </div>
          </div>
        </div>
      </form>

      {/* Di chuyển DialogFooter ra khỏi form và cố định ở dưới cùng */}
      <DialogFooter className="mt-auto pt-4 border-t flex justify-end w-full">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(false)}
          disabled={isLoading}
          className="mr-2"
        >
          <X className="h-4 w-4 mr-2" /> Hủy
        </Button>
        <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
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
      </DialogFooter>
    </div>
  );
};
