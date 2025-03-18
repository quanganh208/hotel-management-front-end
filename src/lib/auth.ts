import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";

// Định nghĩa kiểu dữ liệu mở rộng cho NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    accessToken?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
    };
  }
}

// Định nghĩa kiểu dữ liệu cho JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
  }
}

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
          return null;
        }

        try {
          // Gọi API service của bạn để xác thực người dùng
          // Đọc URL từ biến môi trường
          // Fixed: Remove unused variable or use it in the uncommented code
          // const authApiUrl = process.env.API_AUTH_URL || "http://localhost:8000";

          // Tạm thời trả về user mẫu để thử nghiệm
          // Bỏ comment phần này và comment phần gọi API khi service chưa sẵn sàng
          return {
            id: "123",
            name: "Test User",
            email: credentials.email,
            accessToken: "test-token",
          };

          /* Tạm thời comment lại phần gọi API thực tế
          const authApiUrl = process.env.API_AUTH_URL || "http://localhost:8000";
          const response = await axios.post(`${authApiUrl}/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          // Nếu API trả về dữ liệu người dùng thành công
          if (response.data && response.data.user) {
            // Trả về đối tượng user mà NextAuth sẽ lưu vào session
            return {
              id: response.data.user.id,
              name: response.data.user.name,
              email: response.data.user.email,
              // Lưu token từ API nếu cần
              accessToken: response.data.accessToken,
            };
          }
          */

          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          // Tạm thời trả về null thay vì throw error để tránh lỗi không mong muốn
          return null;
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
