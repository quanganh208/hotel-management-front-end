import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Clipboard,
  Package,
  Info,
  DollarSign,
  ImageIcon,
  Box,
  Tag,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateProductForm, ProductFormErrors, ItemType } from "./types";

interface ProductEditFormProps {
  updateProductForm: UpdateProductForm;
  formErrors: ProductFormErrors;
  imagePreviewUrl: string | null;
  onFormChange: (
    field: keyof UpdateProductForm,
    value: string | number | File | null,
  ) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNumberInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "sellingPrice" | "costPrice" | "stockQuantity",
  ) => void;
  onSelectChange: (value: string, field: "itemType" | "unit") => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function ProductEditForm({
  updateProductForm,
  formErrors,
  imagePreviewUrl,
  onFormChange,
  onImageChange,
  onNumberInputChange,
  onSelectChange,
}: ProductEditFormProps) {
  return (
    <motion.div
      key="edit-form"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="px-6 space-y-4 pt-2 pb-4"
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="inventoryCode" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-muted-foreground" />
              Mã hàng hóa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="inventoryCode"
              value={updateProductForm.inventoryCode}
              onChange={(e) => onFormChange("inventoryCode", e.target.value)}
              className={cn(formErrors.inventoryCode && "border-destructive")}
            />
            {formErrors.inventoryCode && (
              <p className="text-sm text-destructive">
                {formErrors.inventoryCode}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Tên hàng hóa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={updateProductForm.name}
              onChange={(e) => onFormChange("name", e.target.value)}
              className={cn(formErrors.name && "border-destructive")}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="itemType" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Loại hàng hóa <span className="text-destructive">*</span>
            </Label>
            <Select
              value={updateProductForm.itemType}
              onValueChange={(value) =>
                onSelectChange(value as ItemType, "itemType")
              }
            >
              <SelectTrigger
                className={formErrors.itemType ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Chọn loại hàng hóa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beverage">Đồ uống</SelectItem>
                <SelectItem value="food">Thức ăn</SelectItem>
                <SelectItem value="amenity">Tiện nghi</SelectItem>
                <SelectItem value="equipment">Thiết bị</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.itemType && (
              <p className="text-sm text-destructive">{formErrors.itemType}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit" className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              Đơn vị <span className="text-destructive">*</span>
            </Label>
            <Select
              value={updateProductForm.unit}
              onValueChange={(value) => onSelectChange(value, "unit")}
            >
              <SelectTrigger
                className={formErrors.unit ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chai">Chai</SelectItem>
                <SelectItem value="lon">Lon</SelectItem>
                <SelectItem value="hộp">Hộp</SelectItem>
                <SelectItem value="gói">Gói</SelectItem>
                <SelectItem value="cái">Cái</SelectItem>
                <SelectItem value="bộ">Bộ</SelectItem>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="lít">Lít</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.unit && (
              <p className="text-sm text-destructive">{formErrors.unit}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            Mô tả
          </Label>
          <Textarea
            id="description"
            value={updateProductForm.description}
            onChange={(e) => onFormChange("description", e.target.value)}
            placeholder="Nhập mô tả chi tiết về hàng hoá"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sellingPrice" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Giá bán (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              value={updateProductForm.sellingPrice}
              onChange={(e) => onNumberInputChange(e, "sellingPrice")}
              className={cn(formErrors.sellingPrice && "border-destructive")}
            />
            {formErrors.sellingPrice && (
              <p className="text-sm text-destructive">
                {formErrors.sellingPrice}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="costPrice" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Giá vốn (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="costPrice"
              type="number"
              min="0"
              value={updateProductForm.costPrice}
              onChange={(e) => onNumberInputChange(e, "costPrice")}
              className={cn(formErrors.costPrice && "border-destructive")}
            />
            {formErrors.costPrice && (
              <p className="text-sm text-destructive">{formErrors.costPrice}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stockQuantity" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Tồn kho <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              step="1"
              value={updateProductForm.stockQuantity}
              onChange={(e) => onNumberInputChange(e, "stockQuantity")}
              className={cn(formErrors.stockQuantity && "border-destructive")}
            />
            {formErrors.stockQuantity && (
              <p className="text-sm text-destructive">
                {formErrors.stockQuantity}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Hình ảnh
          </Label>
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="relative w-40 h-40 rounded-md border overflow-hidden bg-muted/30 flex-shrink-0">
              {imagePreviewUrl ? (
                <Image
                  src={imagePreviewUrl}
                  alt={updateProductForm.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 160px) 100vw, 160px"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={onImageChange}
                className={cn(
                  "max-w-full",
                  formErrors.image && "border-destructive",
                )}
              />
              {formErrors.image ? (
                <p className="text-xs text-destructive">{formErrors.image}</p>
              ) : (
                updateProductForm.image && (
                  <p className="text-xs text-muted-foreground">
                    Kích thước file:{" "}
                    {formatFileSize(updateProductForm.image.size)}
                  </p>
                )
              )}
              <p className="text-xs text-muted-foreground">
                Chấp nhận ảnh JPG, PNG, GIF hoặc WEBP dưới 10MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
