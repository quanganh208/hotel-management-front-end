import "next-auth";
import "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken: string;
      provider?: string;
    } & DefaultSession["user"];
  }

  // Bổ sung thuộc tính cho Google Profile
  interface Profile {
    picture?: string;
    sub?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    provider?: string;
  }
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  access_token: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
}
