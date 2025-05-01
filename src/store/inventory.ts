import { create } from "zustand";
import axiosInstance from "@/lib/axios";
import { InventoryResponse, InventoryItem } from "@/types/inventory";
import { toast } from "sonner";

interface InventoryState {
  // Dữ liệu
  items: InventoryItem[];
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    categoryCount: number;
  };

  // Trạng thái
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchInventory: (hotelId: string) => Promise<void>;
  createInventory: (formData: FormData) => Promise<void>;
  updateInventory: (id: string, formData: FormData) => Promise<void>;
  deleteInventory: (id: string, hotelId: string) => Promise<void>;
  clearInventory: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // State mặc định
  items: [],
  stats: {
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    categoryCount: 0,
  },
  isLoading: false,
  error: null,

  // Actions
  fetchInventory: async (hotelId: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axiosInstance.get<InventoryResponse>(
        `/inventory`,
        {
          params: { hotelId },
        },
      );

      const { items, totalItems, totalValue, lowStockItems, categoryCount } =
        response.data;

      set({
        items,
        stats: {
          totalItems,
          totalValue,
          lowStockItems,
          categoryCount,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch inventory",
        isLoading: false,
      });
    }
  },

  createInventory: async (formData: FormData) => {
    try {
      set({ isLoading: true, error: null });

      // Call API to create inventory item
      await axiosInstance.post("/inventory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set({ isLoading: false });
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating inventory item:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create inventory item",
        isLoading: false,
      });
      return Promise.reject(error);
    }
  },

  updateInventory: async (id: string, formData: FormData) => {
    try {
      set({ isLoading: true, error: null });

      // Call API to update inventory item
      await axiosInstance.patch(`/inventory/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Get the updated hotel ID to refresh inventory
      const hotelId = formData.get("hotelId") as string;

      // Refresh inventory data after update
      if (hotelId) {
        await get().fetchInventory(hotelId);
      }

      set({ isLoading: false });
      toast.success("Cập nhật hàng hoá thành công");
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating inventory item:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Cập nhật hàng hoá thất bại";

      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      return Promise.reject(error);
    }
  },

  deleteInventory: async (id: string, hotelId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Call API to delete inventory item
      await axiosInstance.delete(`/inventory/${id}`);

      // Refresh inventory data after deletion
      await get().fetchInventory(hotelId);

      set({ isLoading: false });
      toast.success("Xóa hàng hoá thành công");
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Xóa hàng hoá thất bại";

      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      return Promise.reject(error);
    }
  },

  clearInventory: () => {
    set({
      items: [],
      stats: {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        categoryCount: 0,
      },
      error: null,
    });
  },
}));
