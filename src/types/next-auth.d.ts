import "next-auth";
import "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    accessToken: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken: string;
      provider?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  // Bổ sung thuộc tính cho Google Profile
  interface Profile {
    picture?: string;
    sub?: string;
  }

  // Bổ sung thuộc tính cho Account để lưu ID hệ thống
  interface Account {
    userId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    provider?: string;
    picture?: string;
    role?: string;
  }
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  access_token: string;
  image?: string;
  role?: string;
  requiresTwoFactor?: boolean;
  userId?: string;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
}
