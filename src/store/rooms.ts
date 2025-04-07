import { create } from "zustand";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import {
  RoomFormErrors, RoomStatus,
  RoomStore,
  RoomWithType,
  UpdateRoomForm,
} from "@/types/room";
import { AxiosError } from "axios";
import { ApiError } from "@/types/next-auth";

// API errors
const API_ERRORS = {
  CONNECTION:
    "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
  FETCH_FAILED: "Không thể tải danh sách phòng. Vui lòng thử lại sau.",
  CREATE_FAILED: "Tạo phòng không thành công. Vui lòng thử lại sau.",
  UPDATE_FAILED: "Cập nhật phòng không thành công. Vui lòng thử lại sau.",
  DELETE_FAILED: "Xóa phòng không thành công. Vui lòng thử lại sau.",
};

export const useRoomStore = create<RoomStore>((set, get) => ({
  rooms: [],
  isLoading: false,
  error: null,
  success: null,
  isFetching: false,
  lastFetchTimestamp: new Map(),

  // Form tạo mới
  createRoomForm: {
    roomNumber: "",
    roomTypeId: "",
    floor: "",
    hotelId: "",
    note: "",
  },
  createRoomFormErrors: {
    roomNumber: "",
    roomTypeId: "",
    floor: "",
    hotelId: "",
    note: "",
  },

  // Form cập nhật
  updateRoomForm: {
    roomNumber: "",
    roomTypeId: "",
    floor: "",
    status: RoomStatus.AVAILABLE,
    note: "",
    imageError: "",
  },
  updateRoomFormErrors: {
    roomNumber: "",
    roomTypeId: "",
    floor: "",
    hotelId: "",
    note: "",
  },

  // API functions
  fetchRooms: async (hotelId: string) => {
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
      const response = await axiosInstance.get(`/rooms?hotelId=${hotelId}`);

      // Cập nhật trạng thái
      set({
        rooms: response.data,
        isFetching: false,
        lastFetchTimestamp: new Map(get().lastFetchTimestamp).set(
          hotelId,
          Date.now()
        ),
      });
    } catch (error: unknown) {
      console.error("Lỗi khi tải danh sách phòng:", error);

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
      set({
        error: errorMessage,
        isFetching: false,
      });
    }
  },

  // Form management functions - Tạo mới
  setCreateRoomForm: (field, value) => {
    set((state) => ({
      createRoomForm: {
        ...state.createRoomForm,
        [field]: value,
      },
      createRoomFormErrors: {
        ...state.createRoomFormErrors,
        [field]: "", // Xóa lỗi khi người dùng thay đổi giá trị
      },
    }));
  },

  validateCreateRoomField: (field) => {
    const { createRoomForm } = get();
    let error = "";

    switch (field) {
      case "roomNumber":
        if (!createRoomForm.roomNumber.trim()) {
          error = "Vui lòng nhập số phòng";
        }
        break;
      case "roomTypeId":
        if (!createRoomForm.roomTypeId) {
          error = "Vui lòng chọn hạng phòng";
        }
        break;
      case "floor":
        if (!createRoomForm.floor.trim()) {
          error = "Vui lòng nhập tầng";
        }
        break;
      case "hotelId":
        if (!createRoomForm.hotelId) {
          error = "Khách sạn không hợp lệ";
        }
        break;
      default:
        break;
    }

    set((state) => ({
      createRoomFormErrors: {
        ...state.createRoomFormErrors,
        [field]: error,
      },
    }));

    return !error;
  },

  validateAllCreateRoomFields: () => {
    const fields: (keyof RoomFormErrors)[] = [
      "roomNumber",
      "roomTypeId",
      "floor",
      "hotelId",
    ];
    let isValid = true;

    fields.forEach((field) => {
      if (!get().validateCreateRoomField(field)) {
        isValid = false;
      }
    });

    return isValid;
  },

  resetCreateRoomForm: () => {
    set({
      createRoomForm: {
        roomNumber: "",
        roomTypeId: "",
        floor: "",
        hotelId: "",
        note: "",
      },
      createRoomFormErrors: {
        roomNumber: "",
        roomTypeId: "",
        floor: "",
        hotelId: "",
        note: "",
      },
    });
  },

  createRoom: async () => {
    if (!get().validateAllCreateRoomFields()) {
      return;
    }

    set({ isLoading: true, error: null, success: null });

    try {
      const { createRoomForm } = get();
      const formData = new FormData();

      // Thêm các trường cơ bản
      formData.append("roomNumber", createRoomForm.roomNumber);
      formData.append("roomTypeId", createRoomForm.roomTypeId);
      formData.append("floor", createRoomForm.floor);
      formData.append("hotelId", createRoomForm.hotelId);

      // Thêm ghi chú nếu có
      if (createRoomForm.note) {
        formData.append("note", createRoomForm.note);
      }

      // Thêm ảnh nếu có
      if (createRoomForm.image) {
        formData.append("image", createRoomForm.image);
      }

      const response = await axiosInstance.post(`/rooms`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Xử lý kết quả
      if (response.data) {
        const successMessage =
          response.data.message || "Phòng đã được tạo thành công";

        // Cập nhật state
        set({ success: successMessage, isLoading: false });
        toast.success(successMessage);

        // Reset form sau khi tạo thành công
        get().resetCreateRoomForm();

        // Fetch lại dữ liệu nếu có hotelId
        if (createRoomForm.hotelId) {
          // Đảm bảo tạo xong thì mới fetch dữ liệu mới
          await get().fetchRooms(createRoomForm.hotelId);
        }
      }
    } catch (error: unknown) {
      console.error("Lỗi khi tạo phòng:", error);

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

  // Form management functions - Cập nhật
  setUpdateRoomForm: (field, value) => {
    set((state) => ({
      updateRoomForm: {
        ...state.updateRoomForm,
        [field]: value,
      },
      updateRoomFormErrors: {
        ...state.updateRoomFormErrors,
        [field]: "", // Xóa lỗi khi người dùng thay đổi giá trị
      },
    }));
  },

  validateUpdateRoomField: (field) => {
    const { updateRoomForm } = get();
    let error = "";

    switch (field) {
      case "roomNumber":
        if (!updateRoomForm.roomNumber.trim()) {
          error = "Vui lòng nhập số phòng";
        }
        break;
      case "roomTypeId":
        if (!updateRoomForm.roomTypeId) {
          error = "Vui lòng chọn hạng phòng";
        }
        break;
      case "floor":
        if (!updateRoomForm.floor.trim()) {
          error = "Vui lòng nhập tầng";
        }
        break;
      default:
        break;
    }

    set((state) => ({
      updateRoomFormErrors: {
        ...state.updateRoomFormErrors,
        [field]: error,
      },
    }));

    return !error;
  },

  validateAllUpdateRoomFields: () => {
    const fields: (keyof UpdateRoomForm)[] = [
      "roomNumber",
      "roomTypeId",
      "floor",
    ];
    let isValid = true;

    fields.forEach((field) => {
      if (!get().validateUpdateRoomField(field)) {
        isValid = false;
      }
    });

    return isValid;
  },

  resetUpdateRoomForm: () => {
    set({
      updateRoomForm: {
        roomNumber: "",
        roomTypeId: "",
        floor: "",
        status: RoomStatus.AVAILABLE,
        note: "",
        imageError: "",
      },
      updateRoomFormErrors: {
        roomNumber: "",
        roomTypeId: "",
        floor: "",
        hotelId: "",
        note: "",
      },
    });
  },

  setUpdateFormFromRoom: (room: RoomWithType) => {
    set({
      updateRoomForm: {
        roomNumber: room.roomNumber,
        roomTypeId: room.roomTypeId._id,
        floor: room.floor,
        status: room.status,
        note: room.note || "",
        imageError: "",
      },
    });
  },

  updateRoom: async (roomId: string) => {
    if (!get().validateAllUpdateRoomFields()) {
      return false;
    }

    set({ isLoading: true, error: null, success: null });

    try {
      const { updateRoomForm } = get();
      const formData = new FormData();

      // Thêm các trường cơ bản
      formData.append("roomNumber", updateRoomForm.roomNumber);
      formData.append("roomTypeId", updateRoomForm.roomTypeId);
      formData.append("floor", updateRoomForm.floor);
      formData.append("status", updateRoomForm.status);

      // Thêm ghi chú nếu có
      if (updateRoomForm.note) {
        formData.append("note", updateRoomForm.note);
      }

      // Thêm ảnh nếu có
      if (updateRoomForm.image) {
        formData.append("image", updateRoomForm.image);
      }

      const response = await axiosInstance.patch(`/rooms/${roomId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const successMessage =
        response.data.message || "Phòng đã được cập nhật thành công";

      // Hiển thị thông báo thành công
      toast.success(successMessage);

      // Lấy hotel id từ phòng hiện tại để fetch lại dữ liệu
      const currentRoom = get().rooms.find((room) => room._id === roomId);

      if (currentRoom?.hotelId) {
        // Đảm bảo tải lại dữ liệu trước khi cập nhật state hiển thị
        await get().fetchRooms(currentRoom.hotelId);
      } else {
        // Nếu không tìm thấy hotelId, cập nhật phòng này trong state
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room._id === roomId
              ? {
                  ...room, // Giữ nguyên cấu trúc
                  ...response.data, // Cập nhật với dữ liệu mới từ API
                  roomTypeId: room.roomTypeId, // Giữ nguyên object roomTypeId
                }
              : room
          ),
        }));
      }

      // Cập nhật trạng thái loading và success
      set({
        isLoading: false,
        success: successMessage,
      });

      return true;
    } catch (error: unknown) {
      console.error("Lỗi khi cập nhật phòng:", error);

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

  // Utility functions
  deleteRoom: async (roomId: string) => {
    set({ isLoading: true, error: null, success: null });

    try {
      const response = await axiosInstance.delete(`/rooms/${roomId}`);
      const successMessage =
        response.data?.message || "Phòng đã được xóa thành công";

      set((state) => ({
        rooms: state.rooms.filter((room) => room._id !== roomId),
        isLoading: false,
        success: successMessage,
      }));

      toast.success(successMessage);
      return true;
    } catch (error: unknown) {
      console.error("Lỗi khi xóa phòng:", error);

      // Xử lý lỗi
      let errorMessage = API_ERRORS.DELETE_FAILED;
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
  resetMessages: () => set({ error: null, success: null }),

  // Setter tiện ích
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
}));
