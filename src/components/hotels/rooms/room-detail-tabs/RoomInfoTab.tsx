import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatNumberWithCommas } from "@/lib/utils";
import { RoomWithType, RoomStatus } from "@/types/room";

interface RoomInfoTabProps {
  room: RoomWithType;
  imagePreviewUrl: string | null;
}

const getStatusLabel = (status: string) => {
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
      return status;
  }
};

const getStatusColorClass = (status: string): string => {
  switch (status) {
    case RoomStatus.AVAILABLE:
      return "text-green-600 bg-green-100";
    case RoomStatus.OCCUPIED:
      return "text-purple-600 bg-purple-100";
    case RoomStatus.BOOKED:
      return "text-blue-600 bg-blue-100";
    case RoomStatus.CHECKED_IN:
      return "text-indigo-600 bg-indigo-100";
    case RoomStatus.CHECKED_OUT:
      return "text-amber-600 bg-amber-100";
    case RoomStatus.CLEANING:
      return "text-cyan-600 bg-cyan-100";
    case RoomStatus.MAINTENANCE:
      return "text-red-600 bg-red-100";
    case RoomStatus.OUT_OF_SERVICE:
      return "text-gray-600 bg-gray-100";
    case RoomStatus.RESERVED:
      return "text-teal-600 bg-teal-100";
    default:
      return "text-slate-600 bg-slate-100";
  }
};

export const RoomInfoTab: React.FC<RoomInfoTabProps> = ({
  room,
  imagePreviewUrl,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Hàng 1: Ảnh bên trái, thông tin bên phải */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {room.image || imagePreviewUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={room.image || (imagePreviewUrl as string)}
              alt={`Phòng ${room.roomNumber}`}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center aspect-video bg-muted rounded-lg">
            <p className="text-muted-foreground">Không có ảnh</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Số phòng
            </p>
            <p className="text-base">{room.roomNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tầng</p>
            <p className="text-base">{room.floor}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Hạng phòng
            </p>
            <p className="text-base">
              {room.roomTypeId?.name || "Không xác định"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Trạng thái
            </p>
            <Badge
              variant="outline"
              className={`${getStatusColorClass(room.status)}`}
            >
              {getStatusLabel(room.status)}
            </Badge>
          </div>
        </div>
      </div>

      {room.note && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Ghi chú
          </p>
          <p className="text-sm whitespace-pre-line">{room.note}</p>
        </div>
      )}

      {/* Bảng giá */}
      <div className="mt-2">
        <h3 className="text-lg font-medium mb-3">Bảng giá</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="border-l-4 border-l-blue-500 shadow-sm gap-3 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Giá giờ</p>
              <div className="rounded-full bg-blue-100 p-1 text-blue-500">
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
              </div>
            </div>
            <p className="text-sm font-semibold text-blue-600">
              {room.roomTypeId?.pricePerHour
                ? formatNumberWithCommas(room.roomTypeId.pricePerHour)
                : "N/A"}{" "}
              <span className="text-xs font-normal">VNĐ</span>
            </p>
          </div>

          <div className="border-l-4 border-l-green-500 shadow-sm gap-3 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Giá ngày</p>
              <div className="rounded-full bg-green-100 p-1 text-green-500">
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
              </div>
            </div>
            <p className="text-sm font-semibold text-green-600">
              {room.roomTypeId?.pricePerDay
                ? formatNumberWithCommas(room.roomTypeId.pricePerDay)
                : "N/A"}{" "}
              <span className="text-xs font-normal">VNĐ</span>
            </p>
          </div>

          <div className="border-l-4 border-l-purple-500 shadow-sm gap-3 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Giá đêm</p>
              <div className="rounded-full bg-purple-100 p-1 text-purple-500">
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
              </div>
            </div>
            <p className="text-sm font-semibold text-purple-600">
              {room.roomTypeId?.priceOvernight
                ? formatNumberWithCommas(room.roomTypeId.priceOvernight)
                : "N/A"}{" "}
              <span className="text-xs font-normal">VNĐ</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
