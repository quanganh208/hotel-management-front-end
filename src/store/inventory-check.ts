import { create } from "zustand";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { InventoryCheck, CreateInventoryCheckData } from "@/types/inventory";

interface InventoryCheckState {
  // Dữ liệu
  inventoryChecks: InventoryCheck[];
  selectedCheck: InventoryCheck | null;
  totalItems: number;

  // Trạng thái
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  success: string | null;

  // Actions
  fetchInventoryChecks: (hotelId: string) => Promise<void>;
  fetchInventoryCheckById: (id: string) => Promise<void>;
  createInventoryCheck: (data: CreateInventoryCheckData) => Promise<boolean>;
  updateInventoryCheck: (
    id: string,
    data: Partial<InventoryCheck>,
  ) => Promise<boolean>;
  deleteInventoryCheck: (id: string) => Promise<boolean>;
  balanceInventoryCheck: (id: string) => Promise<boolean>;
  clearInventoryChecks: () => void;
}

export const useInventoryCheckStore = create<InventoryCheckState>(
  (set, get) => ({
    // State mặc định
    inventoryChecks: [],
    selectedCheck: null,
    totalItems: 0,
    isLoading: false,
    isFetching: false,
    error: null,
    success: null,

    // Actions
    fetchInventoryChecks: async (hotelId: string) => {
      try {
        set({ isFetching: true, error: null });

        const response = await axiosInstance.get<InventoryCheck[]>(
          `/inventory-checks`,
          {
            params: { hotelId },
          },
        );

        set({
          inventoryChecks: response.data,
          totalItems: response.data.length,
          isFetching: false,
        });
      } catch (error) {
        console.error("Error fetching inventory checks:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Không thể tải danh sách phiếu kiểm kho",
          isFetching: false,
        });
        throw error;
      }
    },

    fetchInventoryCheckById: async (id: string) => {
      try {
        set({ isLoading: true, error: null });

        const response = await axiosInstance.get<InventoryCheck>(
          `/inventory-checks/${id}`,
        );

        // The API returns the inventory check directly, not nested in a data property
        set({
          selectedCheck: response.data,
          isLoading: false,
        });
      } catch (error) {
        console.error(`Error fetching inventory check ${id}:`, error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Không thể tải chi tiết phiếu kiểm kho",
          isLoading: false,
        });
        throw error;
      }
    },

    createInventoryCheck: async (data: CreateInventoryCheckData) => {
      try {
        set({ isLoading: true, error: null, success: null });

        await axiosInstance.post("/inventory-checks", data, {
          headers: { "Content-Type": "application/json" },
        });

        // Cập nhật lại danh sách phiếu kiểm kho
        const hotelId = data.hotelId;
        if (hotelId) {
          await get().fetchInventoryChecks(hotelId);
        }

        set({ isLoading: false, success: "Tạo phiếu kiểm kho thành công" });
        toast.success("Tạo phiếu kiểm kho thành công");
        return true;
      } catch (error) {
        console.error("Error creating inventory check:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Tạo phiếu kiểm kho thất bại";

        set({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(errorMessage);
        return false;
      }
    },

    updateInventoryCheck: async (id: string, data: Partial<InventoryCheck>) => {
      try {
        set({ isLoading: true, error: null, success: null });

        // Gọi API để cập nhật phiếu kiểm kho
        const response = await axiosInstance.patch(
          `/inventory-checks/${id}`,
          data,
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        // Cập nhật lại phiếu kiểm kho được chọn
        set({
          selectedCheck: response.data.data,
          isLoading: false,
          success: "Cập nhật phiếu kiểm kho thành công",
        });

        // Cập nhật lại danh sách phiếu kiểm kho nếu cần
        const hotelId = data.hotelId;
        if (hotelId) {
          await get().fetchInventoryChecks(hotelId);
        }

        toast.success("Cập nhật phiếu kiểm kho thành công");
        return true;
      } catch (error) {
        console.error(`Error updating inventory check ${id}:`, error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Cập nhật phiếu kiểm kho thất bại";

        set({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(errorMessage);
        return false;
      }
    },

    deleteInventoryCheck: async (id: string) => {
      try {
        set({ isLoading: true, error: null, success: null });

        // Gọi API để xóa phiếu kiểm kho
        await axiosInstance.delete(`/inventory-checks/${id}`);

        // Cập nhật lại danh sách phiếu kiểm kho nếu cần
        const check = get().selectedCheck;
        if (check?.hotelId) {
          await get().fetchInventoryChecks(check.hotelId);
        }

        set({
          selectedCheck: null,
          isLoading: false,
          success: "Xóa phiếu kiểm kho thành công",
        });

        toast.success("Xóa phiếu kiểm kho thành công");
        return true;
      } catch (error) {
        console.error(`Error deleting inventory check ${id}:`, error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Xóa phiếu kiểm kho thất bại";

        set({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(errorMessage);
        return false;
      }
    },

    balanceInventoryCheck: async (id: string) => {
      try {
        set({ isLoading: true, error: null, success: null });

        // Gọi API để cân bằng phiếu kiểm kho
        const response = await axiosInstance.post(
          `/inventory-checks/${id}/balance`,
        );

        // Cập nhật lại phiếu kiểm kho đã được cân bằng
        set({
          selectedCheck: response.data.data,
          isLoading: false,
          success: "Cân bằng kho thành công",
        });

        // Cập nhật lại danh sách phiếu kiểm kho nếu cần
        const check = get().selectedCheck;
        if (check?.hotelId) {
          await get().fetchInventoryChecks(check.hotelId);
        }

        toast.success("Cân bằng kho thành công");
        return true;
      } catch (error) {
        console.error(`Error balancing inventory check ${id}:`, error);
        const errorMessage =
          error instanceof Error ? error.message : "Cân bằng kho thất bại";

        set({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(errorMessage);
        return false;
      }
    },

    clearInventoryChecks: () => {
      set({
        inventoryChecks: [],
        selectedCheck: null,
        totalItems: 0,
        error: null,
        success: null,
      });
    },
  }),
);
