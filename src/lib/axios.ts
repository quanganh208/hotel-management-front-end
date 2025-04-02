import axios from "axios";
import { getSession } from "next-auth/react";

const isServer = typeof window === "undefined";
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Chỉ gọi getSession ở client-side
    if (!isServer) {
      const session = await getSession();
      if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Chỉ xử lý logout ở client-side
    if (!isServer && error.response?.status === 401) {
      const { signOut } = await import("next-auth/react");
      await signOut({ redirect: true, callbackUrl: "/auth/login" });
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
