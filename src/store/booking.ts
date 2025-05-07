import { create } from "zustand";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { ApiError } from "@/types/next-auth";
import { getSession } from "next-auth/react";

// Định nghĩa interface cho đối tượng booking
export interface Booking {
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

// Định nghĩa interface cho form đặt phòng
export interface BookingForm {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  phoneNumber: string;
  guestCount: number;
  note?: string;
}

// Định nghĩa interface cho lỗi form đặt phòng
export interface BookingFormErrors {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  phoneNumber: string;
  guestCount: string;
  note?: string;
}

// Định nghĩa interface cho store đặt phòng
export interface BookingStore {
  // Trạng thái chung
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  success: string | null;

  // Dữ liệu bookings
  bookings: Booking[];
  selectedBooking: Booking | null;
  lastFetchTimestamp: Map<string, number>;

  // Form đặt phòng
  bookingForm: BookingForm;
  bookingFormErrors: BookingFormErrors;

  // Phương thức quản lý form
  setBookingForm: (field: keyof BookingForm, value: string | number) => void;
  validateBookingField: (field: keyof BookingForm) => boolean;
  validateAllBookingFields: () => boolean;
  resetBookingForm: () => void;

  // Phương thức API
  fetchBookings: (hotelId: string) => Promise<void>;
  createBooking: () => Promise<boolean>;
  selectBooking: (booking: Booking | null) => void;

  // Phương thức tiện ích
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  resetMessages: () => void;
}

// Lỗi validation
const VALIDATION_ERRORS = {
  EMPTY_ROOM: "Vui lòng chọn phòng",
  EMPTY_CHECK_IN: "Vui lòng chọn ngày nhận phòng",
  EMPTY_CHECK_OUT: "Vui lòng chọn ngày trả phòng",
  INVALID_DATE_RANGE: "Ngày trả phòng phải sau ngày nhận phòng",
  EMPTY_GUEST_NAME: "Vui lòng nhập tên khách hàng",
  SHORT_GUEST_NAME: "Tên khách hàng phải có ít nhất 2 ký tự",
  EMPTY_PHONE: "Vui lòng nhập số điện thoại",
  INVALID_PHONE: "Số điện thoại không hợp lệ",
  EMPTY_GUEST_COUNT: "Vui lòng nhập số lượng khách",
  INVALID_GUEST_COUNT: "Số lượng khách phải lớn hơn 0",
};

// Lỗi API
const API_ERRORS = {
  CONNECTION:
    "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
  CREATE_FAILED: "Đặt phòng không thành công. Vui lòng thử lại sau.",
  NOT_AUTHENTICATED: "Bạn cần đăng nhập để thực hiện thao tác này.",
  FETCH_FAILED: "Không thể tải danh sách đặt phòng. Vui lòng thử lại sau.",
};

// Khởi tạo giá trị mặc định
const initialState = {
  isLoading: false,
  isFetching: false,
  error: null,
  success: null,
  bookings: [],
  selectedBooking: null,
  lastFetchTimestamp: new Map<string, number>(),
  bookingForm: {
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
    guestName: "",
    phoneNumber: "",
    guestCount: 1,
    note: "",
  },
  bookingFormErrors: {
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
    guestName: "",
    phoneNumber: "",
    guestCount: "",
    note: "",
  },
};

// Thời gian tối đa cho cache (5 phút)
const CACHE_MAX_AGE = 5 * 60 * 1000;

// Tạo store với zustand
export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,

  // Phương thức quản lý form
  setBookingForm: (field, value) => {
    set((state) => ({
      bookingForm: {
        ...state.bookingForm,
        [field]: value,
      },
      bookingFormErrors: {
        ...state.bookingFormErrors,
        [field]: "",
      },
    }));
  },

  validateBookingField: (field) => {
    const { bookingForm } = get();
    let isValid = false;

    switch (field) {
      case "roomId":
        if (!bookingForm.roomId) {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              roomId: VALIDATION_ERRORS.EMPTY_ROOM,
            },
          }));
        } else {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              roomId: "",
            },
          }));
          isValid = true;
        }
        break;

      case "checkInDate":
        if (!bookingForm.checkInDate) {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              checkInDate: VALIDATION_ERRORS.EMPTY_CHECK_IN,
            },
          }));
        } else {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              checkInDate: "",
            },
          }));
          isValid = true;
        }
        break;

      case "checkOutDate":
        if (!bookingForm.checkOutDate) {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              checkOutDate: VALIDATION_ERRORS.EMPTY_CHECK_OUT,
            },
          }));
        } else if (
          bookingForm.checkInDate &&
          new Date(bookingForm.checkOutDate) <=
            new Date(bookingForm.checkInDate)
        ) {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              checkOutDate: VALIDATION_ERRORS.INVALID_DATE_RANGE,
            },
          }));
        } else {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              checkOutDate: "",
            },
          }));
          isValid = true;
        }
        break;

      case "guestName":
        if (!bookingForm.guestName) {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              guestName: VALIDATION_ERRORS.EMPTY_GUEST_NAME,
            },
          }));
        } else if (bookingForm.guestName.length < 2) {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              guestName: VALIDATION_ERRORS.SHORT_GUEST_NAME,
            },
          }));
        } else {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              guestName: "",
            },
          }));
          isValid = true;
        }
        break;

      case "phoneNumber":
        if (!bookingForm.phoneNumber) {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              phoneNumber: VALIDATION_ERRORS.EMPTY_PHONE,
            },
          }));
        } else {
          // Kiểm tra định dạng số điện thoại Việt Nam
          const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
          if (!phoneRegex.test(bookingForm.phoneNumber)) {
            set((state) => ({
              bookingFormErrors: {
                ...state.bookingFormErrors,
                phoneNumber: VALIDATION_ERRORS.INVALID_PHONE,
              },
            }));
          } else {
            set((state) => ({
              bookingFormErrors: {
                ...state.bookingFormErrors,
                phoneNumber: "",
              },
            }));
            isValid = true;
          }
        }
        break;

      case "guestCount":
        if (!bookingForm.guestCount) {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              guestCount: VALIDATION_ERRORS.EMPTY_GUEST_COUNT,
            },
          }));
        } else if (bookingForm.guestCount <= 0) {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              guestCount: VALIDATION_ERRORS.INVALID_GUEST_COUNT,
            },
          }));
        } else {
          set((state) => ({
            bookingFormErrors: {
              ...state.bookingFormErrors,
              guestCount: "",
            },
          }));
          isValid = true;
        }
        break;

      case "note":
        // Ghi chú là tùy chọn, luôn hợp lệ
        isValid = true;
        break;
    }

    return isValid;
  },

  validateAllBookingFields: () => {
    const fields: (keyof BookingForm)[] = [
      "roomId",
      "checkInDate",
      "checkOutDate",
      "guestName",
      "phoneNumber",
      "guestCount",
    ];

    let isValid = true;

    // Gọi validate cho từng trường và nếu có bất kỳ trường nào không hợp lệ,
    // đặt isValid thành false
    fields.forEach((field) => {
      if (!get().validateBookingField(field)) {
        isValid = false;
      }
    });

    return isValid;
  },

  resetBookingForm: () => {
    set({
      bookingForm: initialState.bookingForm,
      bookingFormErrors: initialState.bookingFormErrors,
    });
  },

  // Phương thức API để lấy danh sách bookings
  fetchBookings: async (hotelId: string) => {
    console.log("fetchBookings called with hotelId:", hotelId);

    if (!hotelId) {
      console.log("Error: hotelId not provided");
      set({ error: "ID khách sạn không được cung cấp" });
      return;
    }

    // Kiểm tra cache
    const lastFetch = get().lastFetchTimestamp.get(hotelId) || 0;
    const now = Date.now();

    // Nếu dữ liệu đã được tải trong vòng CACHE_MAX_AGE, không tải lại
    if (now - lastFetch < CACHE_MAX_AGE && get().bookings.length > 0) {
      console.log("Using cached bookings data");
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
      // Gọi API lấy danh sách đặt phòng
      const response = await axiosInstance.get(`/bookings`, {
        params: { hotelId },
      });

      console.log("API response for fetchBookings:", response.data);

      // Cập nhật trạng thái với dữ liệu từ API
      set({
        bookings: response.data,
        isFetching: false,
        lastFetchTimestamp: new Map(get().lastFetchTimestamp).set(
          hotelId,
          Date.now()
        ),
      });

      console.log("Bookings state updated with new data");
    } catch (error: unknown) {
      console.error("Lỗi khi tải danh sách đặt phòng:", error);

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

  // Chọn booking để xem chi tiết
  selectBooking: (booking) => {
    set({ selectedBooking: booking });
  },

  // Phương thức API tạo booking
  createBooking: async () => {
    const { bookingForm, validateAllBookingFields } = get();
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guestName,
      phoneNumber,
      guestCount,
      note,
    } = bookingForm;

    if (!validateAllBookingFields()) {
      return false;
    }

    set({ isLoading: true, error: null, success: null });

    try {
      // Lấy thông tin người dùng từ NextAuth session
      const session = await getSession();

      if (!session?.user?.id) {
        set({ error: API_ERRORS.NOT_AUTHENTICATED });
        toast.error(API_ERRORS.NOT_AUTHENTICATED);
        return false;
      }

      const bookingData = {
        roomId,
        checkInDate,
        checkOutDate,
        guestName,
        phoneNumber,
        guestCount,
        note: note || "",
        createdBy: session.user.id, // Sử dụng id từ NextAuth session
      };

      const response = await axiosInstance.post("/bookings", bookingData);

      if (response.data) {
        const successMessage = response.data.message || "Đặt phòng thành công!";
        set({ success: successMessage });
        toast.success(successMessage);

        // Reset form sau khi đặt phòng thành công
        get().resetBookingForm();
        return true;
      }

      return false;
    } catch (error: unknown) {
      console.error("Lỗi khi đặt phòng:", error);

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

      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Phương thức tiện ích
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  resetMessages: () => set({ error: null, success: null }),
}));
