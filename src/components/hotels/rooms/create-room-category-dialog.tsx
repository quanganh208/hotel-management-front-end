import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

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
import { useRoomCategoryStore } from "@/store/room-categories";

export function CreateRoomCategoryDialog() {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const hotelId = params.id as string;
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const {
    createRoomCategoryForm,
    createRoomCategoryFormErrors,
    isLoading,
    error,
    success,
    setCreateRoomCategoryForm,
    validateCreateRoomCategoryField,
    createRoomCategory,
    resetCreateRoomCategoryForm,
    resetMessages,
  } = useRoomCategoryStore();

  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thiết lập hotelId khi dialog mở
  useEffect(() => {
    if (open && hotelId) {
      setCreateRoomCategoryForm("hotelId", hotelId);
    }
  }, [open, hotelId, setCreateRoomCategoryForm]);

  // Cập nhật URL preview khi hình ảnh thay đổi
  useEffect(() => {
    if (createRoomCategoryForm.image) {
      const url = URL.createObjectURL(createRoomCategoryForm.image);
      setImagePreviewUrl(url);

      // Cleanup function để giải phóng URL khi component unmount hoặc ảnh thay đổi
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreviewUrl(null);
    }
  }, [createRoomCategoryForm.image]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      resetCreateRoomCategoryForm();
      resetMessages();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoomCategory();
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

      setCreateRoomCategoryForm("image", file);
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setCreateRoomCategoryForm("image", null);
  };

  // Xử lý khi thành công hoặc lỗi
  useEffect(() => {
    if (success) {
      setOpen(false);
      resetCreateRoomCategoryForm();
      resetMessages();
    }
  }, [success, hotelId, resetCreateRoomCategoryForm, resetMessages]);

  useEffect(() => {
    if (error) {
      // Không cần gọi toast.error(error) ở đây vì đã được xử lý trong store
      resetMessages();
    }
  }, [error, resetMessages]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm hạng phòng
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[650px] [&>button]:hidden"
        ref={dialogRef}
      >
        <DialogHeader>
          <DialogTitle>Thêm hạng phòng mới</DialogTitle>
          <DialogDescription>
            Điền thông tin hạng phòng vào form bên dưới.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên hạng phòng</Label>
            <Input
              id="name"
              value={createRoomCategoryForm.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCreateRoomCategoryForm("name", e.target.value)
              }
              onBlur={() => validateCreateRoomCategoryField("name")}
              className={cn(
                createRoomCategoryFormErrors.name && "border-destructive"
              )}
              disabled={isLoading}
            />
            {createRoomCategoryFormErrors.name && (
              <p className="text-sm text-destructive">
                {createRoomCategoryFormErrors.name}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả hạng phòng</Label>
            <Textarea
              id="description"
              value={createRoomCategoryForm.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCreateRoomCategoryForm("description", e.target.value)
              }
              onBlur={() => validateCreateRoomCategoryField("description")}
              className={cn(
                createRoomCategoryFormErrors.description && "border-destructive"
              )}
              disabled={isLoading}
              rows={3}
            />
            {createRoomCategoryFormErrors.description && (
              <p className="text-sm text-destructive">
                {createRoomCategoryFormErrors.description}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Ảnh hạng phòng</Label>
            <div className="flex flex-col gap-4">
              {createRoomCategoryForm.image && imagePreviewUrl ? (
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
                    createRoomCategoryFormErrors.image && "border-destructive"
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
              {createRoomCategoryFormErrors.image && (
                <p className="text-sm text-destructive">
                  {createRoomCategoryFormErrors.image}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pricePerHour">Giá giờ (VNĐ)</Label>
              <Input
                id="pricePerHour"
                type="number"
                min="0"
                value={createRoomCategoryForm.pricePerHour || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateRoomCategoryForm(
                    "pricePerHour",
                    parseInt(e.target.value) || 0
                  )
                }
                onBlur={() => validateCreateRoomCategoryField("pricePerHour")}
                className={cn(
                  createRoomCategoryFormErrors.pricePerHour &&
                    "border-destructive"
                )}
                disabled={isLoading}
              />
              <div className="min-h-[20px]">
                {createRoomCategoryFormErrors.pricePerHour && (
                  <p className="text-sm text-destructive">
                    {createRoomCategoryFormErrors.pricePerHour}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pricePerDay">Giá ngày (VNĐ)</Label>
              <Input
                id="pricePerDay"
                type="number"
                min="0"
                value={createRoomCategoryForm.pricePerDay || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateRoomCategoryForm(
                    "pricePerDay",
                    parseInt(e.target.value) || 0
                  )
                }
                onBlur={() => validateCreateRoomCategoryField("pricePerDay")}
                className={cn(
                  createRoomCategoryFormErrors.pricePerDay &&
                    "border-destructive"
                )}
                disabled={isLoading}
              />
              <div className="min-h-[20px]">
                {createRoomCategoryFormErrors.pricePerDay && (
                  <p className="text-sm text-destructive">
                    {createRoomCategoryFormErrors.pricePerDay}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priceOvernight">Giá qua đêm (VNĐ)</Label>
              <Input
                id="priceOvernight"
                type="number"
                min="0"
                value={createRoomCategoryForm.priceOvernight || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateRoomCategoryForm(
                    "priceOvernight",
                    parseInt(e.target.value) || 0
                  )
                }
                onBlur={() => validateCreateRoomCategoryField("priceOvernight")}
                className={cn(
                  createRoomCategoryFormErrors.priceOvernight &&
                    "border-destructive"
                )}
                disabled={isLoading}
              />
              <div className="min-h-[20px]">
                {createRoomCategoryFormErrors.priceOvernight && (
                  <p className="text-sm text-destructive">
                    {createRoomCategoryFormErrors.priceOvernight}
                  </p>
                )}
              </div>
            </div>
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
                "Thêm hạng phòng"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
