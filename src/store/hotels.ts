import { create } from "zustand";
import axiosInstance from "@/lib/axios";
import { HotelStore, CreateHotelForm } from "@/types/hotel";

// Lỗi validation
const VALIDATION_ERRORS = {
  EMPTY_NAME: "Tên khách sạn không được để trống",
  SHORT_NAME: "Tên khách sạn phải có ít nhất 2 ký tự",
  EMPTY_ADDRESS: "Địa chỉ không được để trống",
  SHORT_ADDRESS: "Địa chỉ phải có ít nhất 5 ký tự",
  EMPTY_IMAGE: "Vui lòng chọn ảnh cho khách sạn",
  INVALID_IMAGE:
    "File ảnh không hợp lệ. Chỉ chấp nhận các định dạng: jpg, jpeg, png",
};

// Lỗi API
const API_ERRORS = {
  CONNECTION:
    "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
  CREATE_FAILED: "Tạo khách sạn không thành công. Vui lòng thử lại sau.",
  FETCH_FAILED: "Không thể tải danh sách khách sạn. Vui lòng thử lại sau.",
};

// Khởi tạo giá trị mặc định
const initialState = {
  // Data state
  hotels: [],
  isLoading: false,
  error: null,
  success: null,
  isInitialized: false,

  // Form state
  createHotelForm: {
    name: "",
    address: "",
    image: null,
  },
  createHotelFormErrors: {
    name: "",
    address: "",
    image: "",
  },
};

export const useHotelStore = create<HotelStore>((set, get) => ({
  ...initialState,

  // Data actions
  fetchHotels: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.get("/hotels/me");
      set({ hotels: response.data, isLoading: false, isInitialized: true });
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        error: error.response?.data?.message || API_ERRORS.FETCH_FAILED,
        isLoading: false,
      });
    }
  },

  // Form actions
  setCreateHotelForm: (field, value) => {
    set((state) => ({
      createHotelForm: {
        ...state.createHotelForm,
        [field]: value,
      },
    }));
  },

  validateCreateHotelField: (field) => {
    const { createHotelForm } = get();
    let isValid = false;

    switch (field) {
      case "name":
        if (!createHotelForm.name) {
          set((state) => ({
            createHotelFormErrors: {
              ...state.createHotelFormErrors,
              name: VALIDATION_ERRORS.EMPTY_NAME,
            },
          }));
        } else if (createHotelForm.name.length < 2) {
          set((state) => ({
            createHotelFormErrors: {
              ...state.createHotelFormErrors,
              name: VALIDATION_ERRORS.SHORT_NAME,
            },
          }));
        } else {
          set((state) => ({
            createHotelFormErrors: {
              ...state.createHotelFormErrors,
              name: "",
            },
          }));
          isValid = true;
        }
        break;

      case "address":
        if (!createHotelForm.address) {
          set((state) => ({
            createHotelFormErrors: {
              ...state.createHotelFormErrors,
              address: VALIDATION_ERRORS.EMPTY_ADDRESS,
            },
          }));
        } else if (createHotelForm.address.length < 5) {
          set((state) => ({
            createHotelFormErrors: {
              ...state.createHotelFormErrors,
              address: VALIDATION_ERRORS.SHORT_ADDRESS,
            },
          }));
        } else {
          set((state) => ({
            createHotelFormErrors: {
              ...state.createHotelFormErrors,
              address: "",
            },
          }));
          isValid = true;
        }
        break;

      case "image":
        // Image là optional nên luôn valid
        isValid = true;
        break;
    }

    return isValid;
  },

  validateAllCreateHotelFields: () => {
    const fields: (keyof CreateHotelForm)[] = ["name", "address", "image"];
    const results = fields.map((field) =>
      get().validateCreateHotelField(field),
    );
    return results.every((result) => result === true);
  },

  resetCreateHotelForm: () => {
    set(() => ({
      createHotelForm: initialState.createHotelForm,
      createHotelFormErrors: initialState.createHotelFormErrors,
    }));
  },

  createHotel: async () => {
    const { createHotelForm, validateAllCreateHotelFields } = get();

    if (!validateAllCreateHotelFields()) return;

    set(() => ({ isLoading: true, error: null, success: null }));

    try {
      const formData = new FormData();
      formData.append("name", createHotelForm.name);
      formData.append("address", createHotelForm.address);
      if (createHotelForm.image) {
        formData.append("image", createHotelForm.image);
      }

      const response = await axiosInstance.post("/hotels", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.message) {
        set(() => ({ success: response.data.message }));
      }
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let errorMessage = API_ERRORS.CREATE_FAILED;

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "ECONNREFUSED") {
        errorMessage = API_ERRORS.CONNECTION;
      }

      set(() => ({ error: errorMessage }));
    } finally {
      set(() => ({ isLoading: false }));
    }
  },

  // Common actions
  setError: (error) => set(() => ({ error })),
  setSuccess: (success) => set(() => ({ success })),
  resetMessages: () => set(() => ({ error: null, success: null })),
}));
