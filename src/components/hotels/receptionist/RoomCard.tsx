import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoomWithType, RoomStatus } from "@/types/room";
import { formatNumberWithCommas } from "@/lib/utils";
import {
  CheckCircle,
  Users,
  Clipboard,
  Clock,
  Coffee,
  BedDouble,
} from "lucide-react";
import { motion } from "framer-motion";

function getStatusColor(status: RoomStatus) {
  switch (status) {
    case RoomStatus.AVAILABLE:
      return "bg-green-100 border-green-500 text-green-700";
    case RoomStatus.OCCUPIED:
      return "bg-purple-100 border-purple-500 text-purple-700";
    case RoomStatus.BOOKED:
      return "bg-blue-100 border-blue-500 text-blue-700";
    case RoomStatus.CHECKED_IN:
      return "bg-indigo-100 border-indigo-500 text-indigo-700";
    case RoomStatus.CHECKED_OUT:
      return "bg-amber-100 border-amber-500 text-amber-700";
    case RoomStatus.CLEANING:
      return "bg-cyan-100 border-cyan-500 text-cyan-700";
    case RoomStatus.MAINTENANCE:
      return "bg-red-100 border-red-500 text-red-700";
    case RoomStatus.OUT_OF_SERVICE:
      return "bg-gray-100 border-gray-500 text-gray-700";
    case RoomStatus.RESERVED:
      return "bg-teal-100 border-teal-500 text-teal-700";
    default:
      return "bg-gray-100 border-gray-500 text-gray-700";
  }
}

function getStatusIcon(status: RoomStatus) {
  switch (status) {
    case RoomStatus.AVAILABLE:
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case RoomStatus.OCCUPIED:
    case RoomStatus.CHECKED_IN:
      return <Users className="h-5 w-5 text-purple-600" />;
    case RoomStatus.BOOKED:
    case RoomStatus.RESERVED:
      return <Clipboard className="h-5 w-5 text-blue-600" />;
    case RoomStatus.CHECKED_OUT:
      return <Clock className="h-5 w-5 text-amber-600" />;
    case RoomStatus.CLEANING:
      return <Coffee className="h-5 w-5 text-cyan-600" />;
    default:
      return <BedDouble className="h-5 w-5 text-gray-600" />;
  }
}

function getStatusText(status: RoomStatus) {
  switch (status) {
    case RoomStatus.AVAILABLE:
      return "Trống";
    case RoomStatus.OCCUPIED:
      return "Đang sử dụng";
    case RoomStatus.BOOKED:
      return "Đã đặt trước";
    case RoomStatus.CHECKED_IN:
      return "Đã nhận phòng";
    case RoomStatus.CHECKED_OUT:
      return "Đã trả phòng";
    case RoomStatus.CLEANING:
      return "Đang dọn dẹp";
    case RoomStatus.MAINTENANCE:
      return "Bảo trì";
    case RoomStatus.OUT_OF_SERVICE:
      return "Ngừng sử dụng";
    case RoomStatus.RESERVED:
      return "Đã giữ chỗ";
    default:
      return "Không xác định";
  }
}

function getCardBg(status: RoomStatus) {
  switch (status) {
    case RoomStatus.AVAILABLE:
      return "bg-green-50 dark:bg-green-900/60";
    case RoomStatus.OCCUPIED:
      return "bg-purple-50 dark:bg-purple-900/60";
    case RoomStatus.BOOKED:
      return "bg-blue-50 dark:bg-blue-900/60";
    case RoomStatus.CHECKED_IN:
      return "bg-indigo-50 dark:bg-indigo-900/60";
    case RoomStatus.CHECKED_OUT:
      return "bg-amber-50 dark:bg-amber-900/60";
    case RoomStatus.CLEANING:
      return "bg-cyan-50 dark:bg-cyan-900/60";
    case RoomStatus.MAINTENANCE:
      return "bg-red-50 dark:bg-red-900/60";
    case RoomStatus.OUT_OF_SERVICE:
      return "bg-gray-100 dark:bg-zinc-800";
    case RoomStatus.RESERVED:
      return "bg-teal-50 dark:bg-teal-900/60";
    default:
      return "bg-white dark:bg-zinc-900";
  }
}

export default function RoomCard({
  room,
  onClick,
}: {
  room: RoomWithType;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card
        className={`h-full flex flex-col ${getCardBg(room.status)} hover:shadow-md dark:hover:shadow-lg transition-all`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Phòng {room.roomNumber}
            </CardTitle>
            <div className="flex items-center gap-1">
              {getStatusIcon(room.status)}
            </div>
          </div>
          <CardDescription className="text-gray-500 dark:text-gray-300">
            {room.roomTypeId?.name || "Chưa phân loại"} - Tầng{" "}
            {room.floor || "0"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2 flex-grow">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-300">Giá giờ:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {room.roomTypeId?.pricePerHour
                  ? formatNumberWithCommas(room.roomTypeId.pricePerHour)
                  : "N/A"}{" "}
                đ
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-300">
                Giá ngày:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {room.roomTypeId?.pricePerDay
                  ? formatNumberWithCommas(room.roomTypeId.pricePerDay)
                  : "N/A"}{" "}
                đ
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-300">
                Giá qua đêm:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {room.roomTypeId?.priceOvernight
                  ? formatNumberWithCommas(room.roomTypeId.priceOvernight)
                  : "N/A"}{" "}
                đ
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-3">
          <Badge
            variant="outline"
            className={
              getStatusColor(room.status) +
              " dark:border-zinc-700 dark:bg-opacity-80"
            }
          >
            {getStatusText(room.status)}
          </Badge>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
