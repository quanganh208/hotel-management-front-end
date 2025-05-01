import React from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  BarChart4,
  Package,
  Check,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Product } from "./types";

interface ProductStatsTabProps {
  product: Product;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function ProductStatsTab({ product }: ProductStatsTabProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              Phân tích tồn kho
            </CardTitle>
            <CardDescription>Thông tin về tồn kho và doanh số</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-1">
                <span className="text-muted-foreground text-sm">
                  Tổng giá trị tồn kho:
                </span>
                <span className="font-medium">
                  {formatCurrency(product.stock * product.costPrice)} đ
                </span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-muted-foreground text-sm">
                  Giá trị bán dự kiến:
                </span>
                <span className="font-medium">
                  {formatCurrency(product.stock * product.sellingPrice)} đ
                </span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-muted-foreground text-sm">
                  Lợi nhuận dự kiến:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(
                    product.stock * (product.sellingPrice - product.costPrice),
                  )}{" "}
                  đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart4 className="h-4 w-4 text-primary" />
              Thống kê giá
            </CardTitle>
            <CardDescription>Phân tích giá và lợi nhuận</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">
                    Tỷ suất lợi nhuận
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(
                      ((product.sellingPrice - product.costPrice) /
                        product.sellingPrice) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 dark:from-green-600 dark:to-green-500"
                    style={{
                      width: `${Math.round(
                        ((product.sellingPrice - product.costPrice) /
                          product.sellingPrice) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Trạng thái tồn kho
          </CardTitle>
          <CardDescription>Tình hình và dự báo tồn kho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-2">
            {product.stock <= 10 ? (
              <div className="flex gap-3 items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-8 w-8" />
                <div>
                  <h4 className="font-medium">Sắp hết hàng</h4>
                  <p className="text-sm">
                    Sản phẩm sắp hết, cần nhập thêm hàng
                  </p>
                </div>
              </div>
            ) : product.stock <= 30 ? (
              <div className="flex gap-3 items-center text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-8 w-8" />
                <div>
                  <h4 className="font-medium">Tồn kho thấp</h4>
                  <p className="text-sm">Nên cân nhắc bổ sung thêm hàng</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-center text-green-600 dark:text-green-400">
                <Check className="h-8 w-8" />
                <div>
                  <h4 className="font-medium">Đủ hàng</h4>
                  <p className="text-sm">Tồn kho ở mức an toàn</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
