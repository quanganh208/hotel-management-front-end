import { create } from "zustand";
import { toast } from "sonner";
import {
  CreateRoomCategoryForm,
  CreateRoomCategoryFormErrors,
  Room,
  RoomCategory,
  RoomCategoryStore,
} from "@/types/room";

// Dữ liệu mẫu cho hạng phòng
const mockRoomCategories: RoomCategory[] = [
  {
    _id: "1",
    name: "Phòng Standard",
    description:
      "Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản. Phòng được trang bị đầy đủ tiện nghi như máy lạnh, TV, tủ lạnh mini, phòng tắm riêng với vòi sen nước nóng.",
    roomCount: 10,
    hourlyPrice: 50000,
    dailyPrice: 300000,
    overnightPrice: 200000,
    image:
      "https://avkosajaqtmqjzkqxnkj.supabase.co/storage/v1/object/public/images/hotels/1743669915213-hotel1.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    name: "Phòng Deluxe",
    description:
      "Phòng cao cấp với không gian rộng rãi và view đẹp. Phòng được trang bị đầy đủ tiện nghi cao cấp như máy lạnh, Smart TV, minibar, két sắt, phòng tắm sang trọng với bồn tắm và vòi sen.",
    roomCount: 5,
    hourlyPrice: 80000,
    dailyPrice: 500000,
    overnightPrice: 350000,
    image:
      "https://avkosajaqtmqjzkqxnkj.supabase.co/storage/v1/object/public/images/hotels/1743669915213-hotel1.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "3",
    name: "Phòng Suite",
    description:
      "Phòng hạng sang với không gian riêng biệt và dịch vụ VIP. Phòng Suite gồm phòng khách riêng biệt, phòng ngủ sang trọng, minibar, két sắt, máy pha cà phê, phòng tắm với bồn tắm Jacuzzi.",
    roomCount: 3,
    hourlyPrice: 120000,
    dailyPrice: 800000,
    overnightPrice: 600000,
    image:
      "https://avkosajaqtmqjzkqxnkj.supabase.co/storage/v1/object/public/images/hotels/1743669915213-hotel1.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Dữ liệu mẫu cho phòng
const mockRooms: Room[] = [
  // Phòng Standard
  {
    _id: "101",
    name: "101",
    categoryId: "1",
    area: "Tầng 1",
    status: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "102",
    name: "102",
    categoryId: "1",
    area: "Tầng 1",
    status: "occupied",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "103",
    name: "103",
    categoryId: "1",
    area: "Tầng 1",
    status: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "201",
    name: "201",
    categoryId: "1",
    area: "Tầng 2",
    status: "maintenance",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Phòng Deluxe
  {
    _id: "301",
    name: "301",
    categoryId: "2",
    area: "Tầng 3",
    status: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "302",
    name: "302",
    categoryId: "2",
    area: "Tầng 3",
    status: "occupied",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Phòng Suite
  {
    _id: "401",
    name: "401",
    categoryId: "3",
    area: "Tầng 4",
    status: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useRoomCategoryStore = create<RoomCategoryStore>((set, get) => ({
  roomCategories: [],
  isLoading: false,
  error: null,
  success: null,
  isInitialized: false,
  createRoomCategoryForm: {
    name: "",
    description: "",
    roomCount: 0,
    hourlyPrice: 0,
    dailyPrice: 0,
    overnightPrice: 0,
    image: null,
  },
  createRoomCategoryFormErrors: {
    name: "",
    description: "",
    roomCount: "",
    hourlyPrice: "",
    dailyPrice: "",
    overnightPrice: "",
    image: "",
  },

  fetchRoomCategories: async () => {
    try {
      set({ isLoading: true, error: null });

      // Giả lập API call với dữ liệu mẫu
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({
        roomCategories: mockRoomCategories,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error(error);
      set({
        isLoading: false,
        error: "Không thể tải danh sách hạng phòng",
        isInitialized: true,
      });
    }
  },

  setCreateRoomCategoryForm: (field, value) => {
    set((state) => ({
      createRoomCategoryForm: {
        ...state.createRoomCategoryForm,
        [field]: value,
      },
    }));

    // Clear error for this field
    set((state) => ({
      createRoomCategoryFormErrors: {
        ...state.createRoomCategoryFormErrors,
        [field]: "",
      },
    }));
  },

  validateCreateRoomCategoryField: (field) => {
    const { createRoomCategoryForm } = get();
    let isValid = true;
    let errorMessage = "";

    switch (field) {
      case "name":
        if (!createRoomCategoryForm.name.trim()) {
          errorMessage = "Tên hạng phòng không được để trống";
          isValid = false;
        }
        break;
      case "description":
        if (!createRoomCategoryForm.description.trim()) {
          errorMessage = "Mô tả hạng phòng không được để trống";
          isValid = false;
        }
        break;
      case "roomCount":
        if (createRoomCategoryForm.roomCount <= 0) {
          errorMessage = "Số lượng phòng phải lớn hơn 0";
          isValid = false;
        }
        break;
      case "hourlyPrice":
        if (createRoomCategoryForm.hourlyPrice <= 0) {
          errorMessage = "Giá giờ phải lớn hơn 0";
          isValid = false;
        }
        break;
      case "dailyPrice":
        if (createRoomCategoryForm.dailyPrice <= 0) {
          errorMessage = "Giá cả ngày phải lớn hơn 0";
          isValid = false;
        }
        break;
      case "overnightPrice":
        if (createRoomCategoryForm.overnightPrice <= 0) {
          errorMessage = "Giá qua đêm phải lớn hơn 0";
          isValid = false;
        }
        break;
      case "image":
        if (createRoomCategoryForm.image instanceof File) {
          if (
            !createRoomCategoryForm.image.type.match(
              /^image\/(jpeg|jpg|png|webp)$/
            )
          ) {
            errorMessage = "Chỉ chấp nhận các định dạng: JPG, JPEG, PNG, WEBP";
            isValid = false;
          } else if (createRoomCategoryForm.image.size > 10 * 1024 * 1024) {
            // 10MB
            errorMessage = "Kích thước ảnh không được vượt quá 10MB";
            isValid = false;
          }
        }
        break;
      default:
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

  validateAllCreateRoomCategoryFields: () => {
    const fields: (keyof CreateRoomCategoryForm)[] = [
      "name",
      "description",
      "roomCount",
      "hourlyPrice",
      "dailyPrice",
      "overnightPrice",
    ];

    return fields.every((field) =>
      get().validateCreateRoomCategoryField(field)
    );
  },

  resetCreateRoomCategoryForm: () => {
    set({
      createRoomCategoryForm: {
        name: "",
        description: "",
        roomCount: 0,
        hourlyPrice: 0,
        dailyPrice: 0,
        overnightPrice: 0,
        image: null,
      },
      createRoomCategoryFormErrors: {
        name: "",
        description: "",
        roomCount: "",
        hourlyPrice: "",
        dailyPrice: "",
        overnightPrice: "",
        image: "",
      },
    });
  },

  createRoomCategory: async () => {
    const { validateAllCreateRoomCategoryFields, createRoomCategoryForm } =
      get();

    if (!validateAllCreateRoomCategoryFields()) {
      return;
    }

    try {
      set({ isLoading: true, error: null });

      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Thêm hạng phòng mới vào danh sách
      const newRoomCategory: RoomCategory = {
        _id: Date.now().toString(), // Tạo ID tạm thời
        name: createRoomCategoryForm.name,
        description: createRoomCategoryForm.description,
        roomCount: createRoomCategoryForm.roomCount,
        hourlyPrice: createRoomCategoryForm.hourlyPrice,
        dailyPrice: createRoomCategoryForm.dailyPrice,
        overnightPrice: createRoomCategoryForm.overnightPrice,
        image:
          createRoomCategoryForm.image instanceof File
            ? URL.createObjectURL(createRoomCategoryForm.image)
            : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        roomCategories: [...state.roomCategories, newRoomCategory],
        isLoading: false,
        success: "Thêm hạng phòng thành công",
      }));
    } catch (error) {
      console.error(error);
      set({
        isLoading: false,
        error: "Không thể tạo hạng phòng mới",
      });
    }
  },

  getRoomsByCategory: (categoryId) => {
    return mockRooms.filter((room) => room.categoryId === categoryId);
  },

  setError: (error) => set({ error }),

  setSuccess: (success) => set({ success }),

  resetMessages: () => set({ error: null, success: null }),
}));
