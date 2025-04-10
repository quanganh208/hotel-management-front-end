import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RoomCategory } from "@/types/room";
import { useRoomCategoryStore } from "@/store/room-categories";
import { Edit, X, ImagePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditFormProps {
  category: RoomCategory;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  imagePreviewUrl: string | null;
}

export const EditForm = ({
  category,
  imageFile,
  setImageFile,
  imagePreviewUrl,
}: EditFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    updateRoomCategoryForm,
    updateRoomCategoryFormErrors,
    setUpdateRoomCategoryForm,
    validateUpdateRoomCategoryField,
  } = useRoomCategoryStore();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      parsedValue,
    );
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

  return (
    <motion.div
      key="edit-mode-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex-1 overflow-y-auto p-4"
    >
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
              updateRoomCategoryFormErrors.name && "border-destructive",
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
            onBlur={() => validateUpdateRoomCategoryField("description")}
            className={cn(
              updateRoomCategoryFormErrors.description && "border-destructive",
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
              onBlur={() => validateUpdateRoomCategoryField("pricePerHour")}
              className={cn(
                updateRoomCategoryFormErrors.pricePerHour &&
                  "border-destructive",
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
              onBlur={() => validateUpdateRoomCategoryField("pricePerDay")}
              className={cn(
                updateRoomCategoryFormErrors.pricePerDay &&
                  "border-destructive",
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
              onBlur={() => validateUpdateRoomCategoryField("priceOvernight")}
              className={cn(
                updateRoomCategoryFormErrors.priceOvernight &&
                  "border-destructive",
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
                <span className="text-xs">Chấp nhận: JPG, JPEG, PNG, WEBP</span>
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
    </motion.div>
  );
};
