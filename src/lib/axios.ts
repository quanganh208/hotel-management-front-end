import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage nếu có
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Xử lý lỗi 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Có thể thêm logic refresh token ở đây

      // Hoặc chuyển hướng người dùng đến trang đăng nhập
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
