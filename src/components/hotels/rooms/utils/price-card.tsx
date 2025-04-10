import React from "react";
import { motion } from "framer-motion";
import { formatNumberWithCommas } from "@/lib/utils";

interface PriceCardProps {
  title: string;
  price: number | null;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  textColor: string;
}

export const PriceCard = ({
  title,
  price,
  icon,
  borderColor,
  bgColor,
  textColor,
}: PriceCardProps) => {
  return (
    <motion.div
      className={`border-l-4 ${borderColor} shadow-sm gap-3 p-3 rounded-md`}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm font-medium">{title}</p>
        <div className={`rounded-full ${bgColor} p-1 ${textColor}`}>{icon}</div>
      </div>
      <p className={`text-sm font-semibold ${textColor}`}>
        {price ? formatNumberWithCommas(price) : "N/A"}{" "}
        <span className="text-xs font-normal">VNĐ</span>
      </p>
    </motion.div>
  );
};
