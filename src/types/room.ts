export enum RoomStatus {
  AVAILABLE = "available", // Phòng sẵn sàng cho thuê
  OCCUPIED = "occupied", // Đang có khách ở
  BOOKED = "booked", // Đã được đặt trước nhưng khách chưa đến
  CHECKED_IN = "checked_in", // Khách đã nhận phòng (check-in)
  CHECKED_OUT = "checked_out", // Khách đã trả phòng (check-out), chờ dọn
  CLEANING = "cleaning", // Phòng đang được dọn dẹp
  MAINTENANCE = "maintenance", // Phòng đang sửa chữa, không thể sử dụng
  OUT_OF_SERVICE = "out_of_service", // Phòng tạm ngừng sử dụng
  RESERVED = "reserved", // Được giữ trước (booking nội bộ, khách VIP, v.v.)
}

export interface RoomCategory {
  _id: string;
  name: string;
  description: string;
  hotelId: string;
  pricePerHour: number;
  pricePerDay: number;
  priceOvernight: number;
  rooms: Room[];
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  roomTypeId: string;
  floor: string;
  status: RoomStatus;
  note?: string;
  hotelId: string;
  image?: string;
  bookings: Booking[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomCategoryForm {
  name: string;
  description: string;
  hotelId: string;
  pricePerHour: number;
  pricePerDay: number;
  priceOvernight: number;
  image?: File | null;
}

export interface UpdateRoomCategoryForm {
  name: string;
  description: string;
  pricePerHour: number;
  pricePerDay: number;
  priceOvernight: number;
  image?: File | null;
}

export interface CreateRoomCategoryFormErrors {
  name: string;
  description: string;
  hotelId: string;
  pricePerHour: string;
  pricePerDay: string;
  priceOvernight: string;
  image?: string;
}

export interface UpdateRoomCategoryFormErrors {
  name: string;
  description: string;
  pricePerHour: string;
  pricePerDay: string;
  priceOvernight: string;
  image?: string;
}

export interface RoomCategoryStore {
  roomCategories: RoomCategory[];
  isLoading: boolean;
  error: string | null;
  success: string | null;

  // Thay thế isInitialized và fetchedHotelIds bằng trường mới
  isFetching: boolean;
  lastFetchTimestamp: Map<string, number>;

  // Form tạo mới
  createRoomCategoryForm: CreateRoomCategoryForm;
  createRoomCategoryFormErrors: CreateRoomCategoryFormErrors;

  // Form cập nhật
  updateRoomCategoryForm: UpdateRoomCategoryForm;
  updateRoomCategoryFormErrors: UpdateRoomCategoryFormErrors;

  // API functions
  fetchRoomCategories: (hotelId: string) => Promise<void>;

  // Form management functions - Tạo mới
  setCreateRoomCategoryForm: (
    field: keyof CreateRoomCategoryForm,
    value: string | number | File | null
  ) => void;
  validateCreateRoomCategoryField: (
    field: keyof CreateRoomCategoryForm
  ) => boolean;
  validateAllCreateRoomCategoryFields: () => boolean;
  resetCreateRoomCategoryForm: () => void;
  createRoomCategory: () => Promise<void>;

  // Form management functions - Cập nhật
  setUpdateRoomCategoryForm: (
    field: keyof UpdateRoomCategoryForm,
    value: string | number | File | null
  ) => void;
  validateUpdateRoomCategoryField: (
    field: keyof UpdateRoomCategoryForm
  ) => boolean;
  validateAllUpdateRoomCategoryFields: () => boolean;
  resetUpdateRoomCategoryForm: () => void;
  setUpdateFormFromCategory: (category: RoomCategory) => void;
  updateRoomCategory: (categoryId: string, hotelId: string) => Promise<boolean>;

  // Utility functions
  deleteRoomCategory: (categoryId: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  resetMessages: () => void;
  getRoomsByCategory: (categoryId: string) => Room[];
}

// Định nghĩa interface cho dữ liệu booking mới
export interface BookingDetail {
  _id: string;
  roomId: {
    _id: string;
    roomNumber: string;
    floor: string;
  };
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  phoneNumber: string;
  guestCount: number;
  note: string;
  createdBy: {
    _id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface cũ vẫn giữ lại để tương thích với code hiện tại
export interface Booking {
  _id: string;
  roomId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa type cho dữ liệu cập nhật booking
export interface UpdateBookingData {
  checkInDate?: string;
  checkOutDate?: string;
  guestName?: string;
  phoneNumber?: string;
  guestCount?: number;
  note?: string;
}

// Định nghĩa type cho dữ liệu khách vãng lai (walk-in)
export interface GuestWalkInData {
  guestName: string;
  phoneNumber: string;
  guestCount: number;
  checkInDate?: string;
  checkOutDate?: string;
  note?: string;
}

// Định nghĩa type cho kết quả của thao tác check-in
export interface CheckInResult {
  success: boolean;
  message: string;
  room: Room;
  booking: BookingDetail;
}

export interface RoomWithType {
  _id: string;
  roomNumber: string;
  roomTypeId: RoomCategory;
  floor: string;
  status: RoomStatus;
  note?: string;
  hotelId: string;
  image?: string;
  bookings: Booking[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomForm {
  roomNumber: string;
  roomTypeId: string;
  floor: string;
  hotelId: string;
  note?: string;
  image?: File | null;
}

export interface UpdateRoomForm {
  roomNumber: string;
  roomTypeId: string;
  floor: string;
  status: RoomStatus;
  note?: string;
  image?: File | null;
  imageError?: string;
}

export interface RoomFormErrors {
  roomNumber: string;
  roomTypeId: string;
  floor: string;
  hotelId: string;
  note?: string;
  image?: string;
}

export interface RoomStore {
  rooms: RoomWithType[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
  isFetching: boolean;
  lastFetchTimestamp: Map<string, number>;

  // Form tạo mới
  createRoomForm: CreateRoomForm;
  createRoomFormErrors: RoomFormErrors;

  // Form cập nhật
  updateRoomForm: UpdateRoomForm;
  updateRoomFormErrors: RoomFormErrors;

  // API functions
  fetchRooms: (hotelId: string) => Promise<void>;

  // Form management functions - Tạo mới
  setCreateRoomForm: (
    field: keyof CreateRoomForm,
    value: string | File | null
  ) => void;
  validateCreateRoomField: (field: keyof CreateRoomForm) => boolean;
  validateAllCreateRoomFields: () => boolean;
  resetCreateRoomForm: () => void;
  createRoom: () => Promise<void>;

  // Form management functions - Cập nhật
  setUpdateRoomForm: (
    field: keyof UpdateRoomForm,
    value: string | File | null
  ) => void;
  validateUpdateRoomField: (field: keyof UpdateRoomForm) => boolean;
  validateAllUpdateRoomFields: () => boolean;
  resetUpdateRoomForm: () => void;
  setUpdateFormFromRoom: (room: RoomWithType) => void;
  updateRoom: (roomId: string) => Promise<boolean>;

  // Utility functions
  deleteRoom: (roomId: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  resetMessages: () => void;
}
