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
import { useHotelStore } from "@/store/hotels";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CreateHotelDialog() {
  const [open, setOpen] = useState(false);
  const {
    createHotelForm,
    createHotelFormErrors,
    isLoading,
    error,
    success,
    setCreateHotelForm,
    createHotel,
    resetCreateHotelForm,
    resetMessages,
    fetchHotels,
  } = useHotelStore();

  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      resetCreateHotelForm();
      resetMessages();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createHotel();
  };

  useEffect(() => {
    if (success) {
      toast.success(success);
      setOpen(false);
      fetchHotels();
      resetCreateHotelForm();
      resetMessages();
    }
  }, [success, fetchHotels, resetCreateHotelForm, resetMessages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error("Chỉ chấp nhận các định dạng: JPG, JPEG, PNG");
        return;
      }

      // Kiểm tra kích thước file (10MB = 10 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Kích thước ảnh không được vượt quá 10MB");
        return;
      }

      setCreateHotelForm("image", file);
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setCreateHotelForm("image", null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm khách sạn
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" ref={dialogRef}>
        <DialogHeader>
          <DialogTitle>Thêm khách sạn mới</DialogTitle>
          <DialogDescription>
            Điền thông tin khách sạn của bạn vào form bên dưới.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên khách sạn</Label>
            <Input
              id="name"
              value={createHotelForm.name}
              onChange={(e) => setCreateHotelForm("name", e.target.value)}
              className={cn(createHotelFormErrors.name && "border-destructive")}
              disabled={isLoading}
            />
            {createHotelFormErrors.name && (
              <p className="text-sm text-destructive">
                {createHotelFormErrors.name}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={createHotelForm.address}
              onChange={(e) => setCreateHotelForm("address", e.target.value)}
              className={cn(
                createHotelFormErrors.address && "border-destructive"
              )}
              disabled={isLoading}
            />
            {createHotelFormErrors.address && (
              <p className="text-sm text-destructive">
                {createHotelFormErrors.address}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Ảnh khách sạn (không bắt buộc)</Label>
            <div className="flex flex-col gap-4">
              {createHotelForm.image ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={URL.createObjectURL(createHotelForm.image)}
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
                    createHotelFormErrors.image && "border-destructive"
                  )}
                >
                  <ImagePlus className="h-8 w-8" />
                  <span>Nhấp vào đây để chọn ảnh</span>
                  <span className="text-xs">Chấp nhận: JPG, JPEG, PNG</span>
                  <span className="text-xs">Kích thước tối đa: 10MB</span>
                </label>
              )}
              <input
                id="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
                ref={fileInputRef}
              />
              {createHotelFormErrors.image && (
                <p className="text-sm text-destructive">
                  {createHotelFormErrors.image}
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
                "Tạo khách sạn"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
