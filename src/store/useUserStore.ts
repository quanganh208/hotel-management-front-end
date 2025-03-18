import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/api/userApi";
import userApi from "@/api/userApi";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await userApi.login({ email, password });
          if (data.token) {
            localStorage.setItem("token", data.token);
          }
          set({ user: data.user, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Đăng nhập thất bại",
            isLoading: false,
          });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await userApi.register({ name, email, password });
          if (data.token) {
            localStorage.setItem("token", data.token);
          }
          set({ user: data.user, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Đăng ký thất bại",
            isLoading: false,
          });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null });
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await userApi.getCurrentUser();
          set({ user, isLoading: false });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              "Không thể lấy thông tin người dùng",
            isLoading: false,
          });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await userApi.updateProfile(data);
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message || "Cập nhật thông tin thất bại",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "user-storage", // tên của item trong localStorage
    },
  ),
);
