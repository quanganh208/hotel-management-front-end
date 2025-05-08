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
        twoFactorToken: { label: "2FA Token", type: "text" },
      },
      async authorize(credentials) {
        // Nếu có token 2FA, sử dụng token đó để đăng nhập
        if (credentials?.twoFactorToken) {
          try {
            // Giải mã token và trả về thông tin người dùng
            const userData = JSON.parse(
              atob(credentials.twoFactorToken.split(".")[1])
            );

            return {
              id: userData.sub,
              name: userData.name,
              email: userData.email,
              accessToken: credentials.twoFactorToken,
              role: userData.role,
              image:
                userData.image ||
                `/api/avatar?name=${encodeURIComponent(userData.name)}`,
            };
          } catch (error) {
            throw new Error("Token 2FA không hợp lệ");
          }
        }

        // Đăng nhập thông thường
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email và mật khẩu là bắt buộc");
        }

        try {
          const response = await authService.login(
            credentials.email,
            credentials.password
          );

          // Kiểm tra nếu cần xác thực 2FA
          if (response.requiresTwoFactor) {
            throw new Error(`REQUIRES_2FA:${response.userId}`);
          }

          if (response && response.access_token) {
            return {
              id: response._id,
              name: response.name,
              email: response.email,
              accessToken: response.access_token,
              role: response.role,
              image:
                response.image ||
                `/api/avatar?name=${encodeURIComponent(response.name)}`,
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

          // Nếu là lỗi từ mã của chúng ta (như yêu cầu 2FA), truyền tiếp
          if (
            error instanceof Error &&
            error.message.startsWith("REQUIRES_2FA:")
          ) {
            throw error;
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
          const response = await authService.googleAuth(account.id_token!);

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
        token.role = user.role;

        // Nếu user.image có sẵn từ credentials, lưu vào token
        if (user.image) {
          token.picture = user.image;
        }
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
        session.user.role = token.role;

        // Đảm bảo image được truyền từ token sang session
        if (token.picture) {
          session.user.image = token.picture;
        }

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
      // Nếu API trả về lỗi yêu cầu xác thực 2 yếu tố
      if (
        error.response?.status === 401 &&
        error.response?.data?.requiresTwoFactor &&
        error.response?.data?.userId
      ) {
        return {
          requiresTwoFactor: true,
          userId: error.response.data.userId,
          message: error.response.data.message || "Yêu cầu xác thực hai yếu tố",
        } as any;
      }
      throw error;
    }
  },

  async googleAuth(idToken: string): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        "/auth/google-auth",
        { idToken }
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
};
