import { Room, RoomStatus } from "@/types/room";

export const getStatusColor = (status: Room["status"]) => {
  switch (status) {
    case RoomStatus.AVAILABLE:
      return "bg-green-500";
    case RoomStatus.OCCUPIED:
      return "bg-purple-500";
    case RoomStatus.BOOKED:
      return "bg-blue-500";
    case RoomStatus.CHECKED_IN:
      return "bg-indigo-500";
    case RoomStatus.CHECKED_OUT:
      return "bg-amber-500";
    case RoomStatus.CLEANING:
      return "bg-cyan-500";
    case RoomStatus.MAINTENANCE:
      return "bg-red-500";
    case RoomStatus.OUT_OF_SERVICE:
      return "bg-gray-500";
    case RoomStatus.RESERVED:
      return "bg-teal-500";
    default:
      return "bg-gray-500";
  }
};

export const getStatusText = (status: Room["status"]) => {
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
};
