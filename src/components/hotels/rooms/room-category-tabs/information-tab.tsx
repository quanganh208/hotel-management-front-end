import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { RoomCategory } from "@/types/room";
import { PriceCard } from "../utils/price-card";

interface InformationTabProps {
  category: RoomCategory;
}

export const InformationTab = ({ category }: InformationTabProps) => {
  return (
    <motion.div
      key="information-tab-content"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-6">
        {/* Hàng 1: Ảnh bên trái, thông tin bên phải */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {category.image ? (
            <motion.div
              className="relative aspect-video overflow-hidden rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="flex items-center justify-center aspect-video bg-muted rounded-lg">
              <p className="text-muted-foreground">Không có ảnh</p>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-medium">Mô tả</h3>
              <p className="text-sm mt-1 text-muted-foreground">
                {category.description}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Số lượng phòng</h3>
              <p className="text-sm mt-1 text-muted-foreground">
                {category.rooms?.length || 0} phòng
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hàng 2: Bảng giá chiếm toàn bộ chiều rộng */}
        <motion.div
          className="mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-lg font-medium mb-3">Bảng giá</h3>
          <div className="grid grid-cols-3 gap-4">
            <PriceCard
              title="Giá giờ"
              price={category.pricePerHour}
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              borderColor="border-l-blue-500"
              bgColor="bg-blue-100"
              textColor="text-blue-600"
            />

            <PriceCard
              title="Giá ngày"
              price={category.pricePerDay}
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              }
              borderColor="border-l-green-500"
              bgColor="bg-green-100"
              textColor="text-green-600"
            />

            <PriceCard
              title="Giá đêm"
              price={category.priceOvernight}
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              }
              borderColor="border-l-purple-500"
              bgColor="bg-purple-100"
              textColor="text-purple-600"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
