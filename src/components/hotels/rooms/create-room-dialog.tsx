import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRoomStore } from "@/store/rooms";
import { useRoomCategoryStore } from "@/store/room-categories";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const hotelId = params.id as string;
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const {
    createRoomForm,
    createRoomFormErrors,
    isLoading,
    error,
    success,
    setCreateRoomForm,
    validateCreateRoomField,
    createRoom,
    resetCreateRoomForm,
    resetMessages,
  } = useRoomStore();

  const {
    roomCategories,
    fetchRoomCategories,
    isFetching: isFetchingCategories,
  } = useRoomCategoryStore();

  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thiết lập hotelId khi dialog mở và load danh sách hạng phòng
  useEffect(() => {
    if (open && hotelId) {
      setCreateRoomForm("hotelId", hotelId);
      fetchRoomCategories(hotelId);
    }
  }, [open, hotelId, setCreateRoomForm, fetchRoomCategories]);

  // Cập nhật URL preview khi hình ảnh thay đổi
  useEffect(() => {
    if (createRoomForm.image) {
      const url = URL.createObjectURL(createRoomForm.image as File);
      setImagePreviewUrl(url);

      // Cleanup function để giải phóng URL khi component unmount hoặc ảnh thay đổi
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreviewUrl(null);
    }
  }, [createRoomForm.image]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      resetCreateRoomForm();
      resetMessages();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoom();
  };

  // Xử lý khi thành công hoặc lỗi
  useEffect(() => {
    if (success) {
      setOpen(false);
      resetCreateRoomForm();
      resetMessages();
    }
  }, [success, resetCreateRoomForm, resetMessages]);

  useEffect(() => {
    if (error) {
      resetMessages();
    }
  }, [error, resetMessages]);

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

      setCreateRoomForm("image", file);
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setCreateRoomForm("image", null);
  };

  // Xóa lỗi cho trường roomTypeId
  const clearRoomTypeIdError = () => {
    // Xóa lỗi bằng cách trực tiếp cập nhật state trong store
    useRoomStore.setState((state) => ({
      createRoomFormErrors: {
        ...state.createRoomFormErrors,
        roomTypeId: "",
      },
    }));
  };

  // Theo dõi thay đổi của roomTypeId và tự động xóa lỗi
  useEffect(() => {
    if (createRoomForm.roomTypeId) {
      clearRoomTypeIdError();
    }
  }, [createRoomForm.roomTypeId]);

  // Lọc danh sách hạng phòng cho khách sạn hiện tại
  const filteredCategories = roomCategories.filter(
    (category) => category.hotelId === hotelId
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm phòng
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[650px] [&>button]:hidden"
        ref={dialogRef}
      >
        <DialogHeader>
          <DialogTitle>Thêm phòng mới</DialogTitle>
          <DialogDescription>
            Điền thông tin phòng vào form bên dưới.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="roomNumber">Số phòng</Label>
              <Input
                id="roomNumber"
                value={createRoomForm.roomNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateRoomForm("roomNumber", e.target.value)
                }
                onBlur={() => validateCreateRoomField("roomNumber")}
                className={cn(
                  createRoomFormErrors.roomNumber && "border-destructive"
                )}
                disabled={isLoading}
              />
              <div className="min-h-[20px]">
                {createRoomFormErrors.roomNumber && (
                  <p className="text-sm text-destructive">
                    {createRoomFormErrors.roomNumber}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="floor">Tầng</Label>
              <Input
                id="floor"
                value={createRoomForm.floor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateRoomForm("floor", e.target.value)
                }
                onBlur={() => validateCreateRoomField("floor")}
                className={cn(
                  createRoomFormErrors.floor && "border-destructive"
                )}
                disabled={isLoading}
              />
              <div className="min-h-[20px]">
                {createRoomFormErrors.floor && (
                  <p className="text-sm text-destructive">
                    {createRoomFormErrors.floor}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="roomTypeId">Hạng phòng</Label>
            <Select
              value={createRoomForm.roomTypeId}
              onValueChange={(value) => {
                setCreateRoomForm("roomTypeId", value);
              }}
              disabled={isLoading || isFetchingCategories}
              onOpenChange={(open) => {
                // Chỉ kiểm tra khi đóng select và chưa có giá trị được chọn
                // Không kiểm tra khi mở select
                if (!open && !createRoomForm.roomTypeId) {
                  validateCreateRoomField("roomTypeId");
                }
              }}
            >
              <SelectTrigger
                className={cn(
                  createRoomFormErrors.roomTypeId && "border-destructive"
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
            <div className="min-h-[20px]">
              {createRoomFormErrors.roomTypeId && (
                <p className="text-sm text-destructive">
                  {createRoomFormErrors.roomTypeId}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Ảnh phòng</Label>
            <div className="flex flex-col gap-4">
              {createRoomForm.image && imagePreviewUrl ? (
                <div className="relative aspect-video max-w-md mx-auto w-full overflow-hidden rounded-lg border">
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
                </div>
              ) : (
                <label
                  htmlFor="image"
                  className={cn(
                    "flex aspect-video max-w-md mx-auto w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-accent/50",
                    createRoomFormErrors.image && "border-destructive"
                  )}
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
              <div className="min-h-[20px]">
                {createRoomFormErrors.image && (
                  <p className="text-sm text-destructive">
                    {createRoomFormErrors.image}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={createRoomForm.note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCreateRoomForm("note", e.target.value)
              }
              rows={3}
              disabled={isLoading}
              placeholder="Nhập ghi chú về phòng (không bắt buộc)"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Thêm phòng"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
