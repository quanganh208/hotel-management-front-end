import { create } from "zustand";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import {
  CreateRoomCategoryForm,
  RoomCategory,
  RoomCategoryStore,
  UpdateRoomCategoryForm,
} from "@/types/room";
import { AxiosError } from "axios";
import { ApiError } from "@/types/next-auth";

// API errors
const API_ERRORS = {
  CONNECTION:
    "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
  FETCH_FAILED: "Không thể tải danh sách hạng phòng. Vui lòng thử lại sau.",
  CREATE_FAILED: "Tạo hạng phòng không thành công. Vui lòng thử lại sau.",
  UPDATE_FAILED: "Cập nhật hạng phòng không thành công. Vui lòng thử lại sau.",
};

export const useRoomCategoryStore = create<RoomCategoryStore>((set, get) => ({
  // Trạng thái cơ bản
  roomCategories: [],
  isLoading: false,
  error: null,
  success: null,

  // Giảm bớt trạng thái dư thừa, loại bỏ isInitialized và fetchedHotelIds
  isFetching: false,
  lastFetchTimestamp: new Map<string, number>(), // Lưu thời điểm fetch gần nhất cho mỗi khách sạn

  // Form tạo mới hạng phòng
  createRoomCategoryForm: {
    name: "",
    description: "",
    hotelId: "",
    pricePerHour: 0,
    pricePerDay: 0,
    priceOvernight: 0,
    image: null,
  },

  // Lưu trữ lỗi form
  createRoomCategoryFormErrors: {
    name: "",
    description: "",
    hotelId: "",
    pricePerHour: "",
    pricePerDay: "",
    priceOvernight: "",
    image: "",
  },

  // Form cập nhật hạng phòng
  updateRoomCategoryForm: {
    name: "",
    description: "",
    pricePerHour: 0,
    pricePerDay: 0,
    priceOvernight: 0,
    image: null,
  },

  // Lưu trữ lỗi form cập nhật
  updateRoomCategoryFormErrors: {
    name: "",
    description: "",
    pricePerHour: "",
    pricePerDay: "",
    priceOvernight: "",
    image: "",
  },

  // Fetch danh sách hạng phòng
  fetchRoomCategories: async (hotelId: string) => {
    if (!hotelId) {
      set({ error: "ID khách sạn không được cung cấp" });
      return;
    }

    // Đang fetch dữ liệu, không fetch lại
    if (get().isFetching) {
      return;
    }

    // Bắt đầu fetch
    set({ isFetching: true, error: null });

    try {
      // Gọi API
      const response = await axiosInstance.get(
        `/room-types?hotelId=${hotelId}`,
      );

      // Lọc loại bỏ dữ liệu cũ của khách sạn này
      const otherHotelsCategories = get().roomCategories.filter(
        (cat) => cat.hotelId !== hotelId,
      );

      // Cập nhật trạng thái
      set({
        roomCategories: [...otherHotelsCategories, ...response.data],
        isFetching: false,
        lastFetchTimestamp: new Map(get().lastFetchTimestamp).set(
          hotelId,
          Date.now(),
        ),
      });
    } catch (error: unknown) {
      console.error("Lỗi khi tải danh sách hạng phòng:", error);

      // Xử lý lỗi
      let errorMessage = API_ERRORS.FETCH_FAILED;
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (
        axiosError.code === "ECONNREFUSED" ||
        axiosError.code === "ERR_NETWORK"
      ) {
        errorMessage = API_ERRORS.CONNECTION;
      }

      toast.error(errorMessage);
      set({ isFetching: false, error: errorMessage });
    }
  },

  // Cập nhật giá trị form
  setCreateRoomCategoryForm: (field, value) => {
    set((state) => ({
      createRoomCategoryForm: {
        ...state.createRoomCategoryForm,
        [field]: value,
      },
      createRoomCategoryFormErrors: {
        ...state.createRoomCategoryFormErrors,
        [field]: "", // Xóa lỗi khi người dùng thay đổi giá trị
      },
    }));
  },

  // Cập nhật giá trị form chỉnh sửa
  setUpdateRoomCategoryForm: (field, value) => {
    set((state) => ({
      updateRoomCategoryForm: {
        ...state.updateRoomCategoryForm,
        [field]: value,
      },
      updateRoomCategoryFormErrors: {
        ...state.updateRoomCategoryFormErrors,
        [field]: "", // Xóa lỗi khi người dùng thay đổi giá trị
      },
    }));
  },

  // Thiết lập form cập nhật từ category hiện tại
  setUpdateFormFromCategory: (category: RoomCategory) => {
    set({
      updateRoomCategoryForm: {
        name: category.name,
        description: category.description,
        pricePerHour: category.pricePerHour,
        pricePerDay: category.pricePerDay,
        priceOvernight: category.priceOvernight,
        image: null, // Không đặt ảnh mặc định
      },
      updateRoomCategoryFormErrors: {
        name: "",
        description: "",
        pricePerHour: "",
        pricePerDay: "",
        priceOvernight: "",
        image: "",
      },
    });
  },

  // Validate trường dữ liệu
  validateCreateRoomCategoryField: (field) => {
    const { createRoomCategoryForm } = get();
    let isValid = true;
    let errorMessage = "";

    switch (field) {
      case "name":
        if (!createRoomCategoryForm.name.trim()) {
          isValid = false;
          errorMessage = "Tên hạng phòng không được để trống";
        } else if (createRoomCategoryForm.name.trim().length < 2) {
          isValid = false;
          errorMessage = "Tên hạng phòng phải có ít nhất 2 ký tự";
        }
        break;

      case "description":
        if (!createRoomCategoryForm.description.trim()) {
          isValid = false;
          errorMessage = "Mô tả hạng phòng không được để trống";
        } else if (createRoomCategoryForm.description.trim().length < 10) {
          isValid = false;
          errorMessage = "Mô tả hạng phòng phải có ít nhất 10 ký tự";
        }
        break;

      case "hotelId":
        if (!createRoomCategoryForm.hotelId) {
          isValid = false;
          errorMessage = "ID khách sạn không được để trống";
        }
        break;

      case "pricePerHour":
        if (createRoomCategoryForm.pricePerHour <= 0) {
          isValid = false;
          errorMessage = "Giá theo giờ phải lớn hơn 0";
        }
        break;

      case "pricePerDay":
        if (createRoomCategoryForm.pricePerDay <= 0) {
          isValid = false;
          errorMessage = "Giá theo ngày phải lớn hơn 0";
        }
        break;

      case "priceOvernight":
        if (createRoomCategoryForm.priceOvernight <= 0) {
          isValid = false;
          errorMessage = "Giá qua đêm phải lớn hơn 0";
        }
        break;
    }

    set((state) => ({
      createRoomCategoryFormErrors: {
        ...state.createRoomCategoryFormErrors,
        [field]: errorMessage,
      },
    }));

    return isValid;
  },

  // Validate trường dữ liệu cập nhật
  validateUpdateRoomCategoryField: (field) => {
    const { updateRoomCategoryForm } = get();
    let isValid = true;
    let errorMessage = "";

    switch (field) {
      case "name":
        if (!updateRoomCategoryForm.name.trim()) {
          isValid = false;
          errorMessage = "Tên hạng phòng không được để trống";
        } else if (updateRoomCategoryForm.name.trim().length < 2) {
          isValid = false;
          errorMessage = "Tên hạng phòng phải có ít nhất 2 ký tự";
        }
        break;

      case "description":
        if (!updateRoomCategoryForm.description.trim()) {
          isValid = false;
          errorMessage = "Mô tả hạng phòng không được để trống";
        } else if (updateRoomCategoryForm.description.trim().length < 10) {
          isValid = false;
          errorMessage = "Mô tả hạng phòng phải có ít nhất 10 ký tự";
        }
        break;

      case "pricePerHour":
        if (updateRoomCategoryForm.pricePerHour <= 0) {
          isValid = false;
          errorMessage = "Giá theo giờ phải lớn hơn 0";
        }
        break;

      case "pricePerDay":
        if (updateRoomCategoryForm.pricePerDay <= 0) {
          isValid = false;
          errorMessage = "Giá theo ngày phải lớn hơn 0";
        }
        break;

      case "priceOvernight":
        if (updateRoomCategoryForm.priceOvernight <= 0) {
          isValid = false;
          errorMessage = "Giá qua đêm phải lớn hơn 0";
        }
        break;
    }

    set((state) => ({
      updateRoomCategoryFormErrors: {
        ...state.updateRoomCategoryFormErrors,
        [field]: errorMessage,
      },
    }));

    return isValid;
  },

  // Validate tất cả trường
  validateAllCreateRoomCategoryFields: () => {
    const fields: (keyof CreateRoomCategoryForm)[] = [
      "name",
      "description",
      "hotelId",
      "pricePerHour",
      "pricePerDay",
      "priceOvernight",
    ];
    return fields.every((field) =>
      get().validateCreateRoomCategoryField(field),
    );
  },

  // Validate tất cả trường cập nhật
  validateAllUpdateRoomCategoryFields: () => {
    const fields: (keyof UpdateRoomCategoryForm)[] = [
      "name",
      "description",
      "pricePerHour",
      "pricePerDay",
      "priceOvernight",
    ];
    return fields.every((field) =>
      get().validateUpdateRoomCategoryField(field),
    );
  },

  // Reset form
  resetCreateRoomCategoryForm: () => {
    set({
      createRoomCategoryForm: {
        name: "",
        description: "",
        hotelId: "",
        pricePerHour: 0,
        pricePerDay: 0,
        priceOvernight: 0,
        image: null,
      },
      createRoomCategoryFormErrors: {
        name: "",
        description: "",
        hotelId: "",
        pricePerHour: "",
        pricePerDay: "",
        priceOvernight: "",
        image: "",
      },
    });
  },

  // Reset form cập nhật
  resetUpdateRoomCategoryForm: () => {
    set({
      updateRoomCategoryForm: {
        name: "",
        description: "",
        pricePerHour: 0,
        pricePerDay: 0,
        priceOvernight: 0,
        image: null,
      },
      updateRoomCategoryFormErrors: {
        name: "",
        description: "",
        pricePerHour: "",
        pricePerDay: "",
        priceOvernight: "",
        image: "",
      },
    });
  },

  // Tạo mới hạng phòng
  createRoomCategory: async () => {
    // Kiểm tra dữ liệu
    if (!get().validateAllCreateRoomCategoryFields()) {
      return;
    }

    set({ isLoading: true, error: null, success: null });
    const { createRoomCategoryForm } = get();

    try {
      // Tạo FormData
      const formData = new FormData();
      formData.append("hotelId", createRoomCategoryForm.hotelId);
      formData.append("name", createRoomCategoryForm.name);
      formData.append(
        "pricePerHour",
        createRoomCategoryForm.pricePerHour.toString(),
      );
      formData.append(
        "pricePerDay",
        createRoomCategoryForm.pricePerDay.toString(),
      );
      formData.append(
        "priceOvernight",
        createRoomCategoryForm.priceOvernight.toString(),
      );
      formData.append("description", createRoomCategoryForm.description);

      // Thêm ảnh nếu có
      if (createRoomCategoryForm.image) {
        formData.append("image", createRoomCategoryForm.image);
      }

      // Gọi API
      const response = await axiosInstance.post("/room-types", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Xử lý kết quả
      if (response.data) {
        const successMessage =
          response.data.message || "Tạo hạng phòng thành công";
        set({ success: successMessage, isLoading: false });
        toast.success(successMessage);

        // Reset form và fetch lại dữ liệu
        get().resetCreateRoomCategoryForm();
        if (createRoomCategoryForm.hotelId) {
          // Đảm bảo tạo xong thì mới fetch dữ liệu mới
          await get().fetchRoomCategories(createRoomCategoryForm.hotelId);
        }
      }
    } catch (error: unknown) {
      console.error("Lỗi khi tạo hạng phòng:", error);

      // Xử lý lỗi
      let errorMessage = API_ERRORS.CREATE_FAILED;
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (
        axiosError.code === "ECONNREFUSED" ||
        axiosError.code === "ERR_NETWORK"
      ) {
        errorMessage = API_ERRORS.CONNECTION;
      }

      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  // Cập nhật hạng phòng
  updateRoomCategory: async (categoryId: string, hotelId: string) => {
    // Kiểm tra dữ liệu
    if (!get().validateAllUpdateRoomCategoryFields()) {
      return false;
    }

    set({ isLoading: true, error: null, success: null });
    const { updateRoomCategoryForm } = get();

    try {
      // Tạo FormData
      const formData = new FormData();
      formData.append("name", updateRoomCategoryForm.name);
      formData.append(
        "pricePerHour",
        updateRoomCategoryForm.pricePerHour.toString(),
      );
      formData.append(
        "pricePerDay",
        updateRoomCategoryForm.pricePerDay.toString(),
      );
      formData.append(
        "priceOvernight",
        updateRoomCategoryForm.priceOvernight.toString(),
      );
      formData.append("description", updateRoomCategoryForm.description);

      // Thêm ảnh nếu có
      if (updateRoomCategoryForm.image) {
        formData.append("image", updateRoomCategoryForm.image);
      }

      // Gọi API
      const response = await axiosInstance.patch(
        `/room-types/${categoryId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // Xử lý kết quả
      if (response.data) {
        const successMessage =
          response.data.message || "Cập nhật hạng phòng thành công";
        set({ success: successMessage, isLoading: false });
        toast.success(successMessage);

        // Reset form và fetch lại dữ liệu
        get().resetUpdateRoomCategoryForm();
        if (hotelId) {
          // Đảm bảo cập nhật xong thì mới fetch dữ liệu mới
          await get().fetchRoomCategories(hotelId);
        }
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error("Lỗi khi cập nhật hạng phòng:", error);

      // Xử lý lỗi
      let errorMessage = API_ERRORS.UPDATE_FAILED;
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (
        axiosError.code === "ECONNREFUSED" ||
        axiosError.code === "ERR_NETWORK"
      ) {
        errorMessage = API_ERRORS.CONNECTION;
      }

      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Lấy danh sách phòng theo hạng phòng
  getRoomsByCategory: (categoryId) => {
    const category = get().roomCategories.find((cat) => cat._id === categoryId);
    return category?.rooms || [];
  },

  // Xóa hạng phòng
  deleteRoomCategory: async (categoryId: string) => {
    if (!categoryId) return false;

    set({ isLoading: true, error: null, success: null });

    try {
      // Gọi API xóa
      const response = await axiosInstance.delete(`/room-types/${categoryId}`);
      const successMessage =
        response.data?.message || "Xóa hạng phòng thành công";

      // Thông báo thành công
      toast.success(successMessage);

      // Cập nhật state
      set((state) => ({
        roomCategories: state.roomCategories.filter(
          (category) => category._id !== categoryId,
        ),
        isLoading: false,
        success: successMessage,
      }));

      return true;
    } catch (error: unknown) {
      console.error("Lỗi khi xóa hạng phòng:", error);

      // Xử lý lỗi
      let errorMessage =
        "Xóa hạng phòng không thành công. Vui lòng thử lại sau.";
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (
        axiosError.code === "ECONNREFUSED" ||
        axiosError.code === "ERR_NETWORK"
      ) {
        errorMessage = API_ERRORS.CONNECTION;
      }

      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);

      return false;
    }
  },

  // Reset thông báo
  resetMessages: () => {
    set({ error: null, success: null });
  },

  // Setter tiện ích
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
}));
