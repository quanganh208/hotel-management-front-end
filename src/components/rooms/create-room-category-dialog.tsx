import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
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
import { useRoomCategoryStore } from "@/store/room-categories";

export function CreateRoomCategoryDialog() {
  const [open, setOpen] = useState(false);
  const {
    createRoomCategoryForm,
    createRoomCategoryFormErrors,
    isLoading,
    error,
    success,
    setCreateRoomCategoryForm,
    createRoomCategory,
    resetCreateRoomCategoryForm,
    resetMessages,
    fetchRoomCategories,
  } = useRoomCategoryStore();

  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (success) {
      toast.success(success);
      setOpen(false);
      fetchRoomCategories();
      resetCreateRoomCategoryForm();
      resetMessages();
    }
  }, [
    success,
    fetchRoomCategories,
    resetCreateRoomCategoryForm,
    resetMessages,
  ]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm hạng phòng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" ref={dialogRef}>
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
            <Label>Ảnh hạng phòng (không bắt buộc)</Label>
            <div className="flex flex-col gap-4">
              {createRoomCategoryForm.image ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={URL.createObjectURL(createRoomCategoryForm.image)}
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
                    "flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-accent/50",
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

          <div className="grid gap-2">
            <Label htmlFor="roomCount">Số lượng phòng</Label>
            <Input
              id="roomCount"
              type="number"
              min="1"
              value={createRoomCategoryForm.roomCount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCreateRoomCategoryForm(
                  "roomCount",
                  parseInt(e.target.value) || 0
                )
              }
              className={cn(
                createRoomCategoryFormErrors.roomCount && "border-destructive"
              )}
              disabled={isLoading}
            />
            {createRoomCategoryFormErrors.roomCount && (
              <p className="text-sm text-destructive">
                {createRoomCategoryFormErrors.roomCount}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="hourlyPrice">Giá giờ (VNĐ)</Label>
              <Input
                id="hourlyPrice"
                type="number"
                min="0"
                value={createRoomCategoryForm.hourlyPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateRoomCategoryForm(
                    "hourlyPrice",
                    parseInt(e.target.value) || 0
                  )
                }
                className={cn(
                  createRoomCategoryFormErrors.hourlyPrice &&
                    "border-destructive"
                )}
                disabled={isLoading}
              />
              {createRoomCategoryFormErrors.hourlyPrice && (
                <p className="text-sm text-destructive">
                  {createRoomCategoryFormErrors.hourlyPrice}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dailyPrice">Giá cả ngày (VNĐ)</Label>
              <Input
                id="dailyPrice"
                type="number"
                min="0"
                value={createRoomCategoryForm.dailyPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateRoomCategoryForm(
                    "dailyPrice",
                    parseInt(e.target.value) || 0
                  )
                }
                className={cn(
                  createRoomCategoryFormErrors.dailyPrice &&
                    "border-destructive"
                )}
                disabled={isLoading}
              />
              {createRoomCategoryFormErrors.dailyPrice && (
                <p className="text-sm text-destructive">
                  {createRoomCategoryFormErrors.dailyPrice}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="overnightPrice">Giá qua đêm (VNĐ)</Label>
              <Input
                id="overnightPrice"
                type="number"
                min="0"
                value={createRoomCategoryForm.overnightPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateRoomCategoryForm(
                    "overnightPrice",
                    parseInt(e.target.value) || 0
                  )
                }
                className={cn(
                  createRoomCategoryFormErrors.overnightPrice &&
                    "border-destructive"
                )}
                disabled={isLoading}
              />
              {createRoomCategoryFormErrors.overnightPrice && (
                <p className="text-sm text-destructive">
                  {createRoomCategoryFormErrors.overnightPrice}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo hạng phòng"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
