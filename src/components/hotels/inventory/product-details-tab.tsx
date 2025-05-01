import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  ImageIcon,
  DollarSign,
  MessageSquare,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "./types";

interface ProductDetailsTabProps {
  product: Product;
  imagePreviewUrl: string | null;
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

// Helper function to map itemType to human-readable labels
function getItemTypeLabel(itemType: string): string {
  const typeMap: Record<string, string> = {
    beverage: "Đồ uống",
    food: "Thức ăn",
    amenity: "Tiện nghi",
    equipment: "Thiết bị",
    other: "Khác",
  };

  return typeMap[itemType] || itemType;
}

export function ProductDetailsTab({
  product,
  imagePreviewUrl,
}: ProductDetailsTabProps) {
  return (
    <motion.div
      key="info-display"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="relative w-40 h-40 rounded-lg overflow-hidden border bg-muted/30 flex-shrink-0 dark:border-slate-700">
          {imagePreviewUrl ? (
            <Image
              src={imagePreviewUrl}
              fill
              sizes="(max-width: 160px) 100vw, 160px"
              className="object-cover"
              alt={product.name}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-14 h-14" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-semibold">{product.name}</h3>
            <div className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <span>{product.inventoryCode}</span>
              {product.itemType && <span>•</span>}
              {product.itemType && (
                <span>{getItemTypeLabel(product.itemType)}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="overflow-hidden bg-muted/30 dark:bg-muted/20">
              <CardHeader className="px-4">
                <CardTitle className="text-sm font-normal flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Tồn kho
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="font-medium text-lg">
                  {product.stock} {product.unit || "cái"}
                </div>
                <p className="text-xs text-muted-foreground opacity-80">
                  Số lượng hiện có
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-sky-50 dark:bg-sky-950/20">
              <CardHeader className="px-4">
                <CardTitle className="text-sm font-normal flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                  <DollarSign className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Giá bán
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sky-700 dark:text-sky-300">
                <div className="font-medium text-lg">
                  {formatCurrency(product.sellingPrice)} đ
                </div>
                <p className="text-xs text-sky-600 dark:text-sky-400 opacity-80">
                  Giá niêm yết
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-purple-50 dark:bg-purple-950/20">
              <CardHeader className="px-4">
                <CardTitle className="text-sm font-normal flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Lợi nhuận
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-purple-700 dark:text-purple-300">
                <div className="font-medium text-lg">
                  {formatCurrency(product.sellingPrice - product.costPrice)} đ
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 opacity-80">
                  Trên mỗi {product.unit || "cái"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Mô tả sản phẩm
          </h4>
          <p className="text-muted-foreground rounded-md bg-muted/30 p-3 text-sm">
            {product.description || "Không có mô tả."}
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            Thông tin thêm
          </h4>
          <div className="space-y-2 text-sm rounded-md bg-muted/30 p-3">
            <div className="flex items-baseline gap-2">
              <span className="font-medium w-24 flex-shrink-0">Mã hàng:</span>
              <span className="text-muted-foreground truncate">
                {product.inventoryCode}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium w-24 flex-shrink-0">Đơn vị:</span>
              <span className="text-muted-foreground truncate">
                {product.unit || "cái"}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium w-24 flex-shrink-0">Loại hàng:</span>
              <span className="text-muted-foreground truncate">
                {getItemTypeLabel(product.itemType)}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium w-24 flex-shrink-0">Giá vốn:</span>
              <span className="text-muted-foreground">
                {formatCurrency(product.costPrice)} đ
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium w-24 flex-shrink-0">Ngày tạo:</span>
              <span className="text-muted-foreground">
                {new Date(product.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium w-24 flex-shrink-0">Cập nhật:</span>
              <span className="text-muted-foreground">
                {new Date(product.updatedAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
