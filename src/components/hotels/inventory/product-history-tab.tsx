import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { UpdateHistoryItem } from "./types";

interface ProductHistoryTabProps {
  updateHistory: UpdateHistoryItem[];
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function ProductHistoryTab({ updateHistory }: ProductHistoryTabProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      <div className="text-muted-foreground text-sm mb-2">
        Lịch sử thay đổi gần đây nhất cho sản phẩm này
      </div>

      {updateHistory.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          Không có lịch sử cập nhật
        </div>
      ) : (
        updateHistory.map((item, index) => (
          <Card key={index} className="overflow-hidden border bg-muted/20">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{item.action}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.details}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{new Date(item.date).toLocaleDateString("vi-VN")}</span>
                  <span>•</span>
                  <span>{item.user}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </motion.div>
  );
}
