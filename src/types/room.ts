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
  name: string;
  categoryId: string;
  area: string;
  status: "available" | "occupied" | "maintenance";
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
    value: string | number | File | null,
  ) => void;
  validateCreateRoomCategoryField: (
    field: keyof CreateRoomCategoryForm,
  ) => boolean;
  validateAllCreateRoomCategoryFields: () => boolean;
  resetCreateRoomCategoryForm: () => void;
  createRoomCategory: () => Promise<void>;

  // Form management functions - Cập nhật
  setUpdateRoomCategoryForm: (
    field: keyof UpdateRoomCategoryForm,
    value: string | number | File | null,
  ) => void;
  validateUpdateRoomCategoryField: (
    field: keyof UpdateRoomCategoryForm,
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
