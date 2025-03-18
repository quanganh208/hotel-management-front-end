import { useCallback, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { User } from "@/api/userApi";

export function useUser() {
  const {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
  } = useUserStore();

  // Tự động lấy thông tin người dùng nếu có token
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [user, fetchCurrentUser]);

  // Hàm wrapper cho login
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
      return useUserStore.getState().error === null;
    },
    [login]
  );

  // Hàm wrapper cho register
  const handleRegister = useCallback(
    async (name: string, email: string, password: string) => {
      await register(name, email, password);
      return useUserStore.getState().error === null;
    },
    [register]
  );

  // Hàm wrapper cho update profile
  const handleUpdateProfile = useCallback(
    async (data: Partial<User>) => {
      await updateProfile(data);
      return useUserStore.getState().error === null;
    },
    [updateProfile]
  );

  return {
    user,
    isLoading,
    error,
    isLoggedIn: !!user,
    login: handleLogin,
    register: handleRegister,
    logout,
    updateProfile: handleUpdateProfile,
  };
}
