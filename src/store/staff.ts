import { create } from "zustand";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import {
  Staff,
  StaffFormErrors,
  StaffRole,
  StaffStore,
  UpdateStaffForm,
  Gender,
} from "@/types/staff";
import { AxiosError } from "axios";
import { ApiError } from "@/types/next-auth";

// API errors
const API_ERRORS = {
  CONNECTION:
    "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
  FETCH_FAILED: "Không thể tải danh sách nhân viên. Vui lòng thử lại sau.",
  CREATE_FAILED: "Tạo nhân viên không thành công. Vui lòng thử lại sau.",
  UPDATE_FAILED: "Cập nhật nhân viên không thành công. Vui lòng thử lại sau.",
  DELETE_FAILED: "Xóa nhân viên không thành công. Vui lòng thử lại sau.",
};

export const useStaffStore = create<StaffStore>((set, get) => ({
  staff: [],
  isLoading: false,
  error: null,
  success: null,
  isFetching: false,
  lastFetchTimestamp: new Map(),

  // Form tạo mới
  createStaffForm: {
    employeeCode: "",
    name: "",
    phoneNumber: "",
    email: "",
    role: "",
    hotelId: "",
    note: "",
    imageError: "",
  },
  createStaffFormErrors: {
    employeeCode: "",
    name: "",
    phoneNumber: "",
    email: "",
    role: "",
    hotelId: "",
    note: "",
    gender: "",
    birthday: "",
  },

  // Form cập nhật
  updateStaffForm: {
    employeeCode: "",
    name: "",
    phoneNumber: "",
    email: "",
    role: StaffRole.MANAGER,
    note: "",
    imageError: "",
  },
  updateStaffFormErrors: {
    employeeCode: "",
    name: "",
    phoneNumber: "",
    email: "",
    role: "",
    hotelId: "",
    note: "",
    gender: "",
    birthday: "",
  },

  // API functions
  fetchStaff: async (hotelId: string) => {
    console.log("fetchStaff called with hotelId:", hotelId);

    if (!hotelId) {
      console.log("Error: hotelId not provided");
      set({ error: "ID khách sạn không được cung cấp" });
      return;
    }

    // Đang fetch dữ liệu, không fetch lại
    if (get().isFetching) {
      console.log("Already fetching data, skipping");
      return;
    }

    // Bắt đầu fetch
    set({ isFetching: true, error: null });

    try {
      // Gọi API lấy danh sách nhân viên
      const response = await axiosInstance.get(`/employees`, {
        params: { hotelId },
      });

      console.log("API response for fetchStaff:", response.data);

      // Cập nhật trạng thái với dữ liệu từ API
      set({
        staff: response.data,
        isFetching: false,
        lastFetchTimestamp: new Map(get().lastFetchTimestamp).set(
          hotelId,
          Date.now()
        ),
      });

      console.log("Staff state updated with new data");
    } catch (error: unknown) {
      console.error("Lỗi khi tải danh sách nhân viên:", error);

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
  setCreateStaffForm: (field, value) => {
    set((state) => ({
      createStaffForm: {
        ...state.createStaffForm,
        [field]: value,
      },
      createStaffFormErrors: {
        ...state.createStaffFormErrors,
        [field]: "", // Xóa lỗi khi người dùng thay đổi giá trị
      },
    }));
  },

  validateCreateStaffField: (field) => {
    const { createStaffForm } = get();
    let error = "";

    switch (field) {
      case "name":
        if (!createStaffForm.name.trim()) {
          error = "Vui lòng nhập tên nhân viên";
        }
        break;
      case "phoneNumber":
        if (!createStaffForm.phoneNumber.trim()) {
          error = "Vui lòng nhập số điện thoại";
        } else if (!/^0\d{9}$/.test(createStaffForm.phoneNumber)) {
          error =
            "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 số)";
        }
        break;
      case "email":
        if (!createStaffForm.email.trim()) {
          error = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createStaffForm.email)) {
          error = "Email không hợp lệ";
        }
        break;
      case "role":
        if (!createStaffForm.role) {
          error = "Vui lòng chọn chức vụ";
        }
        break;
      case "gender":
        if (!createStaffForm.gender) {
          error = "Vui lòng chọn giới tính";
        }
        break;
      case "birthday":
        if (!createStaffForm.birthday) {
          error = "Vui lòng chọn ngày sinh";
        } else {
          // Kiểm tra người dùng phải đủ 18 tuổi
          const today = new Date();
          const birthDate = new Date(createStaffForm.birthday);
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          // Nếu chưa đến tháng sinh nhật hoặc đã đến tháng sinh nhật nhưng chưa đến ngày sinh nhật
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            // Nếu chưa đến tháng/ngày sinh nhật, trừ đi 1 tuổi
            if (age - 1 < 18) {
              error = "Nhân viên phải đủ 18 tuổi";
            }
          } else if (age < 18) {
            error = "Nhân viên phải đủ 18 tuổi";
          }
        }
        break;
      case "hotelId":
        if (!createStaffForm.hotelId) {
          error = "Khách sạn không hợp lệ";
        }
        break;
      default:
        break;
    }

    set((state) => ({
      createStaffFormErrors: {
        ...state.createStaffFormErrors,
        [field]: error,
      },
    }));

    return !error;
  },

  validateAllCreateStaffFields: () => {
    const fields: (keyof StaffFormErrors)[] = [
      "name",
      "phoneNumber",
      "email",
      "role",
      "hotelId",
    ];
    let isValid = true;

    fields.forEach((field) => {
      if (!get().validateCreateStaffField(field)) {
        isValid = false;
      }
    });

    return isValid;
  },

  resetCreateStaffForm: () => {
    set({
      createStaffForm: {
        employeeCode: "",
        name: "",
        phoneNumber: "",
        email: "",
        role: "",
        hotelId: "",
        note: "",
        imageError: "",
      },
      createStaffFormErrors: {
        employeeCode: "",
        name: "",
        phoneNumber: "",
        email: "",
        role: "",
        hotelId: "",
        note: "",
        gender: "",
        birthday: "",
      },
    });
  },

  createStaff: async () => {
    console.log("Starting createStaff function");
    const isValid = get().validateAllCreateStaffFields();
    console.log("Form validation result:", isValid);

    if (!isValid) {
      console.log("Form validation failed");
      return;
    }

    set({ isLoading: true, error: null, success: null });

    try {
      const { createStaffForm } = get();
      const formData = new FormData();

      // Thêm các trường theo yêu cầu của API
      formData.append("name", createStaffForm.name);
      formData.append("phoneNumber", createStaffForm.phoneNumber);
      formData.append("email", createStaffForm.email);
      formData.append("role", createStaffForm.role);
      formData.append("hotelId", createStaffForm.hotelId);
      formData.append("gender", createStaffForm.gender || Gender.MALE);

      // Thêm password mới cho tài khoản (mặc định để phù hợp với API)
      formData.append("password", "Password123@");

      // Thêm ngày sinh nếu có
      if (createStaffForm.birthday) {
        formData.append("birthday", createStaffForm.birthday);
      }

      // Thêm ghi chú nếu có
      if (createStaffForm.note) {
        formData.append("note", createStaffForm.note);
      }

      // Thêm ảnh nếu có
      if (createStaffForm.image) {
        formData.append("image", createStaffForm.image);
      }

      // Gọi API để tạo nhân viên mới
      console.log("Calling API to create staff");
      const response = await axiosInstance.post("/employees", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("API response for createStaff:", response.data);

      // Lấy dữ liệu nhân viên vừa tạo
      const newStaff = response.data.data || response.data;

      // Cập nhật danh sách nhân viên
      set((state) => ({
        staff: [...state.staff, newStaff],
        success: "Nhân viên đã được tạo thành công",
        isLoading: false,
      }));

      toast.success("Nhân viên đã được tạo thành công");

      // Reset form sau khi tạo thành công
      get().resetCreateStaffForm();

      // Refresh danh sách nhân viên
      console.log(
        "Refreshing staff list with hotelId:",
        createStaffForm.hotelId
      );
      if (createStaffForm.hotelId) {
        await get().fetchStaff(createStaffForm.hotelId);
      }
    } catch (error: unknown) {
      console.error("Lỗi khi tạo nhân viên:", error);

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
  setUpdateStaffForm: (field, value) => {
    set((state) => ({
      updateStaffForm: {
        ...state.updateStaffForm,
        [field]: value,
      },
      updateStaffFormErrors: {
        ...state.updateStaffFormErrors,
        [field]: "", // Xóa lỗi khi người dùng thay đổi giá trị
      },
    }));
  },

  validateUpdateStaffField: (field) => {
    const { updateStaffForm } = get();
    let error = "";

    switch (field) {
      case "employeeCode":
        if (!updateStaffForm.employeeCode.trim()) {
          error = "Vui lòng nhập mã nhân viên";
        }
        break;
      case "name":
        if (!updateStaffForm.name.trim()) {
          error = "Vui lòng nhập tên nhân viên";
        }
        break;
      case "phoneNumber":
        if (!updateStaffForm.phoneNumber.trim()) {
          error = "Vui lòng nhập số điện thoại";
        } else if (!/^0\d{9}$/.test(updateStaffForm.phoneNumber)) {
          error =
            "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 số)";
        }
        break;
      case "email":
        if (!updateStaffForm.email.trim()) {
          error = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateStaffForm.email)) {
          error = "Email không hợp lệ";
        }
        break;
      case "role":
        if (!updateStaffForm.role) {
          error = "Vui lòng chọn chức vụ";
        }
        break;
      default:
        break;
    }

    set((state) => ({
      updateStaffFormErrors: {
        ...state.updateStaffFormErrors,
        [field]: error,
      },
    }));

    return !error;
  },

  validateAllUpdateStaffFields: () => {
    const fields: (keyof UpdateStaffForm)[] = [
      "employeeCode",
      "name",
      "phoneNumber",
      "email",
      "role",
    ];
    let isValid = true;

    fields.forEach((field) => {
      if (!get().validateUpdateStaffField(field)) {
        isValid = false;
      }
    });

    return isValid;
  },

  resetUpdateStaffForm: () => {
    set({
      updateStaffForm: {
        employeeCode: "",
        name: "",
        phoneNumber: "",
        email: "",
        role: StaffRole.MANAGER,
        note: "",
        imageError: "",
      },
      updateStaffFormErrors: {
        employeeCode: "",
        name: "",
        phoneNumber: "",
        email: "",
        role: "",
        hotelId: "",
        note: "",
        gender: "",
        birthday: "",
      },
    });
  },

  setUpdateFormFromStaff: (staff: Staff) => {
    set({
      updateStaffForm: {
        employeeCode: staff.employeeCode,
        name: staff.name,
        phoneNumber: staff.phoneNumber,
        email: staff.email,
        role: staff.role,
        note: staff.note || "",
        imageError: "",
        hotelId: staff.hotels?.[0] || "", // Save hotelId from the staff object
      },
    });
  },

  updateStaff: async (staffId: string, hotelId?: string) => {
    console.log(
      "updateStaff called with staffId:",
      staffId,
      "hotelId:",
      hotelId
    );

    if (!get().validateAllUpdateStaffFields()) {
      return false;
    }

    set({ isLoading: true, error: null, success: null });

    try {
      const { updateStaffForm } = get();
      const formData = new FormData();

      // Lấy hotelId từ staff hiện tại nếu không được cung cấp
      const currentStaff = get().staff.find((s) => s._id === staffId);
      const staffHotelId =
        hotelId || updateStaffForm.hotelId || currentStaff?.hotels?.[0];

      // Thêm các trường theo yêu cầu của API
      formData.append("name", updateStaffForm.name);
      formData.append("phoneNumber", updateStaffForm.phoneNumber);
      formData.append("email", updateStaffForm.email);
      formData.append("role", updateStaffForm.role);

      // Thêm employeeCode nếu cần
      formData.append("employeeCode", updateStaffForm.employeeCode);

      // Thêm ghi chú nếu có
      if (updateStaffForm.note) {
        formData.append("note", updateStaffForm.note);
      }

      // Thêm ngày sinh nếu có
      if (updateStaffForm.birthday) {
        formData.append("birthday", updateStaffForm.birthday);
      }

      // Thêm giới tính nếu có
      if (updateStaffForm.gender) {
        formData.append("gender", updateStaffForm.gender);
      }

      // Thêm ảnh nếu có
      if (updateStaffForm.image) {
        formData.append("image", updateStaffForm.image);
      }

      // Thêm hotelId vào formData
      if (staffHotelId) {
        console.log("Adding hotelId to formData:", staffHotelId);
        formData.append("hotelId", staffHotelId);
      }

      // Gọi API để cập nhật nhân viên
      const response = await axiosInstance.patch(
        `/employees/${staffId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Lấy dữ liệu nhân viên sau khi cập nhật
      const updatedStaff = response.data;

      // Cập nhật nhân viên trong danh sách
      set((state) => ({
        staff: state.staff.map((s) => (s._id === staffId ? updatedStaff : s)),
        isLoading: false,
        success: "Nhân viên đã được cập nhật thành công",
      }));

      toast.success("Nhân viên đã được cập nhật thành công");
      return true;
    } catch (error: unknown) {
      console.error("Lỗi khi cập nhật nhân viên:", error);

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
  deleteStaff: async (staffId: string, hotelId?: string) => {
    console.log(
      "deleteStaff called with staffId:",
      staffId,
      "hotelId:",
      hotelId
    );

    set({ isLoading: true, error: null, success: null });

    try {
      // Lấy hotelId từ staff hiện tại nếu không được cung cấp
      const currentStaff = get().staff.find((s) => s._id === staffId);
      const staffHotelId = currentStaff?.hotels?.[0];

      console.log("Using hotelId for delete:", staffHotelId);

      // Gọi API để xóa nhân viên
      // Vì DELETE không thể có body trong một số trường hợp, chúng ta sử dụng URL params
      let url = `/employees/${staffId}`;
      if (staffHotelId) {
        url += `?hotelId=${staffHotelId}`;
      }
      await axiosInstance.delete(url);

      set((state) => ({
        staff: state.staff.filter((s) => s._id !== staffId),
        isLoading: false,
        success: "Nhân viên đã được xóa thành công",
      }));

      toast.success("Nhân viên đã được xóa thành công");
      return true;
    } catch (error: unknown) {
      console.error("Lỗi khi xóa nhân viên:", error);

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
