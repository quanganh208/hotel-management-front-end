import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
          // Xử lý lỗi kết nối
          if (error.code === "ECONNREFUSED") {
            throw new Error(
              "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet hoặc thử lại sau."
            );
          }

          // Trả về đúng thông báo lỗi từ API nếu có
          if (error.response?.data) {
            const apiError = error.response.data as ApiError;

            // Check for inactive account error
            if (
              apiError.statusCode === 400 &&
              apiError.message.includes("chưa được kích hoạt")
            ) {
              throw new Error("INACTIVE_ACCOUNT:" + apiError.message);
            }

            throw new Error(apiError.message);
          }

          // Lỗi chung
          throw new Error("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Xử lý khi người dùng đăng nhập bằng Google
      if (account?.provider === "google" && profile?.email) {
        try {
          // Lấy ảnh từ profile Google
          const imageUrl = profile.picture || undefined;

          const response = await authService.googleAuth(
            profile.email,
            profile.name || "",
            profile.sub || "",
            imageUrl
          );

          if (response.access_token) {
            account.access_token = response.access_token;
            return true;
          }

          // Nếu không có access_token, không cho phép đăng nhập
          return false;
        } catch (error) {
          if (error instanceof Error) {
            // Trả về thông báo lỗi trực tiếp về trang đăng nhập thay vì trang lỗi riêng
            return `/auth/login?error=${encodeURIComponent(error.message)}`;
          }

          // Nếu không phải Error instance, trả về thông báo mặc định
          return `/auth/login?error=${encodeURIComponent("Đăng nhập với Google không thành công")}`;
        }
      }

      // Cho các phương thức đăng nhập khác (như credentials) đi qua
      return true;
    },
    async jwt({ token, user, account }) {
      // Lưu dữ liệu từ user vào token
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }

      // Nếu là đăng nhập Google, lưu thông tin từ Google
      if (account && account.provider === "google") {
        token.provider = account.provider;

        // Lưu access_token từ API (nếu có)
        if (account.access_token) {
          token.accessToken = account.access_token;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Lưu dữ liệu từ token vào session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        // Thêm provider nếu có
        if (token.provider) {
          session.user.provider = token.provider;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // URL trang đăng nhập tùy chỉnh
    signOut: "/auth/logout", // URL trang đăng xuất tùy chỉnh
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

      return response.data;
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error;
    }
  },

  async googleAuth(
    email: string,
    name: string,
    googleId: string,
    image?: string
  ): Promise<LoginResponse> {
    try {
      const data = {
        email,
        name,
        googleId,
        ...(image && { image }), // Chỉ thêm trường image nếu có giá trị
      };

      const response = await axiosInstance.post<LoginResponse>(
        "/auth/google-auth",
        data
      );

      return response.data;
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
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

      // Lỗi mặc định
      throw new Error(
        "Đăng nhập với Google không thành công. Vui lòng thử lại sau."
      );
    }
  },

  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userData");
    }
  },
};
