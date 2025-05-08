export enum StaffRole {
  MANAGER = "MANAGER", // Quản lý
  RECEPTIONIST = "RECEPTIONIST", // Lễ tân
  HOUSEKEEPING = "HOUSEKEEPING", // Phục vụ
  ACCOUNTANT = "ACCOUNTANT", // Kế toán
}

export enum Gender {
  MALE = "MALE", // Nam
  FEMALE = "FEMALE", // Nữ
  OTHER = "OTHER", // Khác
}

export interface Staff {
  _id: string;
  employeeCode: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: StaffRole;
  hotels: string[];
  note?: string;
  gender?: Gender;
  birthday?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  isVerified?: boolean;
  accountType?: string;
}

export interface CreateStaffForm {
  employeeCode: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: StaffRole | string;
  hotelId: string;
  note?: string;
  gender?: Gender | string;
  birthday?: string;
  image?: File | null;
  imageError?: string;
  password: string;
}

export interface UpdateStaffForm {
  employeeCode: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: StaffRole | string;
  note?: string;
  gender?: Gender | string;
  birthday?: string;
  image?: File | null;
  imageError?: string;
  hotelId?: string;
  password?: string;
}

export interface StaffFormErrors {
  employeeCode: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: string;
  hotelId: string;
  note: string;
  gender: string;
  birthday: string;
  password: string;
}

export interface StaffStore {
  staff: Staff[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
  isFetching: boolean;
  lastFetchTimestamp: Map<string, number>;

  // Form tạo mới
  createStaffForm: CreateStaffForm;
  createStaffFormErrors: StaffFormErrors;

  // Form cập nhật
  updateStaffForm: UpdateStaffForm;
  updateStaffFormErrors: StaffFormErrors;

  // API functions
  fetchStaff: (hotelId: string) => Promise<void>;

  // Form management functions - Tạo mới
  setCreateStaffForm: (
    field: keyof CreateStaffForm,
    value: string | File | null,
  ) => void;
  validateCreateStaffField: (field: keyof CreateStaffForm) => boolean;
  validateAllCreateStaffFields: () => boolean;
  resetCreateStaffForm: () => void;
  createStaff: () => Promise<void>;

  // Form management functions - Cập nhật
  setUpdateStaffForm: (
    field: keyof UpdateStaffForm,
    value: string | File | null,
  ) => void;
  validateUpdateStaffField: (field: keyof UpdateStaffForm) => boolean;
  validateAllUpdateStaffFields: () => boolean;
  resetUpdateStaffForm: () => void;
  setUpdateFormFromStaff: (staff: Staff) => void;
  updateStaff: (staffId: string, hotelId?: string) => Promise<boolean>;

  // Utility functions
  deleteStaff: (staffId: string, hotelId?: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  resetMessages: () => void;
}
