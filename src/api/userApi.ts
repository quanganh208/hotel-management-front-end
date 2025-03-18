import axiosInstance from "@/lib/axios";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const userApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get<User>("/users/me");
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await axiosInstance.put(`/users/me`, data);
    return response.data;
  },
};

export default userApi;
