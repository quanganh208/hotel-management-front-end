import axios from "./axios";
import {
  BookingDetail,
  UpdateBookingData,
  GuestWalkInData,
  CheckInResult,
} from "@/types/room";

/**
 * Lấy thông tin chi tiết của một booking theo ID
 * @param bookingId ID của booking cần lấy thông tin
 */
export const getBookingById = async (
  bookingId: string
): Promise<BookingDetail> => {
  const response = await axios.get(`/bookings/${bookingId}`);
  return response.data;
};

/**
 * Lấy danh sách bookings của một phòng
 * @param roomId ID của phòng cần lấy danh sách bookings
 */
export const getBookingsByRoomId = async (
  roomId: string
): Promise<BookingDetail[]> => {
  const response = await axios.get(`/bookings/room/${roomId}`);
  return response.data;
};

/**
 * Lấy booking mới nhất của một phòng
 * @param roomId ID của phòng cần lấy booking mới nhất
 */
export const getLatestBookingByRoomId = async (
  roomId: string
): Promise<BookingDetail | null> => {
  try {
    const response = await axios.get(`/bookings/room/${roomId}/latest`);
    return response.data;
  } catch (error) {
    console.error("Error fetching latest booking:", error);
    return null;
  }
};

/**
 * Cập nhật thông tin đặt phòng
 * @param bookingId ID của booking cần cập nhật
 * @param bookingData Dữ liệu cập nhật cho booking
 */
export const updateBooking = async (
  bookingId: string,
  bookingData: UpdateBookingData
): Promise<BookingDetail> => {
  const response = await axios.patch(`/bookings/${bookingId}`, bookingData);
  return response.data;
};

/**
 * Thực hiện nhận phòng (check-in)
 * @param roomId ID của phòng cần check-in
 * @param bookingId ID của booking
 * @param note Ghi chú khi nhận phòng (không bắt buộc)
 */
export const checkInRoom = async (
  roomId: string,
  bookingId: string,
  note?: string
): Promise<CheckInResult> => {
  const response = await axios.patch(`/rooms/${roomId}/check-in`, {
    bookingId,
    note,
  });
  return response.data;
};

/**
 * Thực hiện nhận phòng trực tiếp cho khách vãng lai (walk-in)
 * @param roomId ID của phòng cần check-in
 * @param guestData Thông tin khách hàng
 */
export const directCheckInRoom = async (
  roomId: string,
  guestData: GuestWalkInData
): Promise<CheckInResult> => {
  // Thêm ngày check-in/check-out mặc định nếu không được cung cấp
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const data = {
    ...guestData,
    checkInDate: guestData.checkInDate || now.toISOString(),
    checkOutDate: guestData.checkOutDate || tomorrow.toISOString(),
  };

  const response = await axios.post(`/rooms/${roomId}/walk-in-check-in`, data);
  return response.data;
};
