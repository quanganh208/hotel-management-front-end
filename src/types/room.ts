export interface RoomCategory {
  _id: string;
  name: string;
  description: string;
  roomCount: number;
  hourlyPrice: number;
  dailyPrice: number;
  overnightPrice: number;
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
  roomCount: number;
  hourlyPrice: number;
  dailyPrice: number;
  overnightPrice: number;
  image?: File | null;
}

export interface CreateRoomCategoryFormErrors {
  name: string;
  description: string;
  roomCount: string;
  hourlyPrice: string;
  dailyPrice: string;
  overnightPrice: string;
  image?: string;
}

export interface RoomCategoryStore {
  roomCategories: RoomCategory[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
  isInitialized: boolean;
  createRoomCategoryForm: CreateRoomCategoryForm;
  createRoomCategoryFormErrors: CreateRoomCategoryFormErrors;
  fetchRoomCategories: () => Promise<void>;
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
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  resetMessages: () => void;
  getRoomsByCategory: (categoryId: string) => Room[];
}
