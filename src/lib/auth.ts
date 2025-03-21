import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import axiosInstance from "./axios";
import { LoginResponse, ApiError } from "@/types/next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email và mật khẩu là bắt buộc");
        }

        try {
          const response = await authService.login(
            credentials.email,
            credentials.password
          );

          if (response && response.access_token) {
            return {
              id: response._id,
              name: response.name,
              email: response.email,
              accessToken: response.access_token,
            };
          }

          return null;
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error("Authentication error:", error);

          // Xử lý lỗi kết nối
          if (error.code === "ECONNREFUSED") {
            throw new Error(
              "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet hoặc thử lại sau."
            );
          }

          // Trả về đúng thông báo lỗi từ API nếu có
          if (error.response?.data) {
            const apiError = error.response.data as ApiError;
            throw new Error(apiError.message);
          }

          // Lỗi chung
          throw new Error("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Lưu dữ liệu từ user vào token
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Lưu dữ liệu từ token vào session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // URL trang đăng nhập tùy chỉnh
    signOut: "/auth/logout", // URL trang đăng xuất tùy chỉnh
    error: "/auth/error", // URL trang lỗi tùy chỉnh
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development", // Bật debug trong môi trường development
  secret: process.env.NEXTAUTH_SECRET, // Đặt trong .env
};

// Fix: Use the correct export pattern for NextAuth.js with App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const { auth, signIn, signOut } = handler;

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const data = {
        email,
        password,
      };

      const response = await axiosInstance.post<LoginResponse>(
        "/auth/login",
        data
      );

      // Lưu token vào localStorage (chỉ ở phía client)
      if (typeof window !== "undefined" && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }

      return response.data;
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error;
    }
  },

  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },
};
